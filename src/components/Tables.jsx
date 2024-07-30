import { useEffect, useState } from "react";
import '../style/Table.scss';
import Cookies from "js-cookie";
import axios from "axios";
import { startOfYear, eachDayOfInterval, format, getDay } from "date-fns";

const Tables = () => {
    const [data, setData] = useState([]);
    const [yearData, setYearData] = useState([]);
    const [tables, setTables] = useState([]);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/table?email=${Cookies.get('email')}`, {
                    headers: {
                        'Authorization': `${Cookies.get('token') ? Cookies.get('token') : null}`
                    }
                });
                setTables(response.data);
                // Fetch study days for each table after setting tables
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

    const fetchDays = async (tableName) => {
        try {
            const response = await axios.get(`http://localhost:8080/day?email=${Cookies.get('email')}&type=${tableName}`, {
                headers: {
                    'Authorization': `${Cookies.get('token') ? Cookies.get('token') : null}`
                }
            });
            // Store data for each table as needed
            setData(prevData => [...prevData, { tableName, days: response.data }]);
            console.log(response.data);
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
                key={`${tableName}-${day.date}`} // Use a unique key
                className={`day ${getDayClass(day.rating)}`}
                title={`${day.date} | Rating: ${day.rating}`}
                style={{ gridColumn: Math.ceil((index + 1) / 7), gridRow: (index % 7) + 2 }}
            ></div>
        ));
    };

    const handleRatingChange = async (rating, tableName) => {
        const day = {
            date: format(new Date(), 'yyyy-MM-dd'),
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

            // Update local data immediately
            setData(prevData => {
                const updatedData = prevData.map(d => {
                    if (d.tableName === tableName) {
                        const updatedDays = d.days.map(dayData => {
                            if (dayData.date === day.date) {
                                return { ...dayData, rating: rating }; // Update the rating
                            }
                            return dayData;
                        });
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

    return (
        <>
        {tables.map(table => (
        <div className="table" key={table.name}>
                <div>
                    <h1>{table.name}</h1>
                    <div className="days-grid">
                        {renderDays(table.name)} {/* Pass table.name as the identifier */}
                    </div>
                    <h1>{table.question}</h1>
                    <div className="todaysRating">
                        <div className="rating-low" onClick={() => handleRatingChange(1, table.name)}></div>
                        <div className="rating-medium" onClick={() => handleRatingChange(2, table.name)}></div>
                        <div className="rating-good" onClick={() => handleRatingChange(3, table.name)}></div>
                        <div className="rating-high" onClick={() => handleRatingChange(4, table.name)}></div>
                    </div>
                </div>
        </div>
         ))}
        </>
        
    );
}

export default Tables;
