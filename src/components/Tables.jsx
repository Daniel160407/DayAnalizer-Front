import { useEffect, useState } from "react";
import '../style/Table.scss';
import Cookies from "js-cookie";
import axios from "axios";
import { startOfYear, eachDayOfInterval, format, getDay } from "date-fns";

const Tables = ({updatedTables}) => {
    const [data, setData] = useState([]);
    const [yearData, setYearData] = useState([]);
    const [tables, setTables] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", question: "", userEmail: Cookies.get('email') });

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/table?email=${Cookies.get('email')}`, {
                    headers: {
                        'Authorization': `${Cookies.get('token') ? Cookies.get('token') : null}`
                    }
                });
                setTables(response.data);
                response.data.forEach(table => fetchDays(table.name));
            } catch (error) {
                console.error("Error fetching tables:", error);
            }
        };

        fetchTables();

        const start = startOfYear(new Date());
        const end = new Date(start);
        end.setFullYear(start.getFullYear() + 1);
        const days = eachDayOfInterval({ start, end });
        setYearData(days.map(day => ({
            date: format(day, 'yyyy-MM-dd'),
            rating: 0,
            dayOfWeek: getDay(day)
        })));
    }, []);

    useEffect(() => {
        if(updatedTables){
            setTables(updatedTables);
            updatedTables.forEach(table => fetchDays(table.name));
        }
    }, [updatedTables]);

    const fetchDays = async (tableName) => {
        try {
            const response = await axios.get(`http://localhost:8080/day?email=${Cookies.get('email')}&type=${tableName}`, {
                headers: {
                    'Authorization': `${Cookies.get('token') ? Cookies.get('token') : null}`
                }
            });

            setData(prevData => [...prevData, { tableName, days: response.data }]);
        } catch (error) {
            console.error(`Error fetching study days for table ${tableName}:`, error);
        }
    };

    const getDayClass = (rating) => {
        if (rating === 4) return 'high';
        if (rating === 3) return 'good';
        if (rating === 2) return 'medium';
        if (rating === 1) return 'low';
        return 'none';
    };

    const renderDays = (tableName) => {
        const mergedData = yearData.map(day => {
            const found = data.find(d => d.tableName === tableName && d.days.find(dd => dd.date === day.date));
            return found ? { ...found.days.find(dd => dd.date === day.date), dayOfWeek: day.dayOfWeek } : { ...day, rating: 0 };
        });

        return mergedData.map((day, index) => (
            <div
                key={`${tableName}-${day.date}`}
                className={`day ${getDayClass(day.rating)}`}
                title={`${day.date} | Rating: ${day.rating}`}
                style={{ gridColumn: Math.ceil((index + 1) / 7), gridRow: (index % 7) + 2 }}
            ></div>
        ));
    };

    const handleRatingChange = async (rating, tableName) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const day = {
            date: today,
            rating: rating,
            type: tableName,
            userEmail: Cookies.get('email'),
        };

        try {
            await axios.post('http://localhost:8080/day', day, {
                headers: {
                    'Authorization': `${Cookies.get('token') ? Cookies.get('token') : null}`
                }
            });

            setData(prevData => {
                const updatedData = prevData.map(d => {
                    if (d.tableName === tableName) {
                        let dayFound = false;
                        const updatedDays = d.days.map(dayData => {
                            if (dayData.date === today) {
                                dayFound = true;
                                return { ...dayData, rating: rating };
                            }
                            return dayData;
                        });

                        if (!dayFound) {
                            updatedDays.push({ date: today, rating: rating });
                        }

                        return { ...d, days: updatedDays };
                    }
                    return d;
                });
                return updatedData;
            });
        } catch (error) {
            console.error("Error submitting rating:", error);
        }
    };

    const handleEdit = (table) => {
        setIsEditing(table.name);
        setEditForm({ name: table.name, question: table.question });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e, table) => {
        e.preventDefault();

        table.userEmail = Cookies.get('email');
        const data = [table, editForm];
        try {
            await axios.put(`http://localhost:8080/table`, data, {
                headers: {
                    'Authorization': `${Cookies.get('token') ? Cookies.get('token') : null}`
                }
            });
            setTables(tables.map(t => t.name === table.name ? { ...t, ...editForm } : t));
            setIsEditing(null);
        } catch (error) {
            console.error("Error updating table:", error);
        }
    };

    const handleDelete = async (tableName) => {
        try {
            await axios.delete(`http://localhost:8080/table?email=${Cookies.get('email')}&name=${tableName}`, {
                headers: {
                    'Authorization': `${Cookies.get('token') ? Cookies.get('token') : null}`
                }
            });
            setTables(tables.filter(table => table.name !== tableName));
        } catch (error) {
            console.error("Error deleting table:", error);
        }
    };

    return (
        <div className="tables">
            {tables.map(table => (
                <div className="table" key={table.name}>
                    {isEditing === table.name ? (
                        <form className="editForm" onSubmit={(e) => handleEditSubmit(e, table)}>
                            <input
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleEditChange}
                                required
                            />
                            <input
                                type="text"
                                name="question"
                                value={editForm.question}
                                onChange={handleEditChange}
                                required
                            />
                            <button className="saveBtn" type="submit">Save</button>
                            <button className="cancelBtn" type="button" onClick={() => setIsEditing(null)}>Cancel</button>
                        </form>
                    ) : (
                        <div>
                            <h1>{table.name}</h1>
                            <div className="edit">
                                <button className="editBtn" onClick={() => handleEdit(table)}>Edit</button>
                                <button className="deleteBtn" onClick={() => handleDelete(table.name)}>Delete</button>
                            </div>
                            <div className="days-grid">
                                {renderDays(table.name)}
                            </div>
                            <h1>{table.question}</h1>
                            <div className="todaysRating">
                                <div className="rating-low" onClick={() => handleRatingChange(1, table.name)}></div>
                                <div className="rating-medium" onClick={() => handleRatingChange(2, table.name)}></div>
                                <div className="rating-good" onClick={() => handleRatingChange(3, table.name)}></div>
                                <div className="rating-high" onClick={() => handleRatingChange(4, table.name)}></div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Tables;
