import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import '../style/Manual.scss';

const Manual = () => {
    const [rating, setRating] = useState('');
    const [table, setTable] = useState([]);
    const [date, setDate] = useState('');
    const [dates, setDates] = useState([]);
    const [type, setType] = useState('');

    useEffect(() => {
        axios
            .get(`http://localhost:8080/table?email=${Cookies.get('email')}`, {
                headers: {
                    Authorization: `${Cookies.get('token') || ''}`
                }
            })
            .then(response => {
                setTable(response.data.map(item => item.name));
                setType(response.data[0].name);
            })
            .catch(error => {
                console.error("Error fetching table data:", error);
            });

        const generateDates = () => {
            const today = new Date();
            const datesList = [];
            for (let i = 0; i <= 30; i++) {
                const pastDate = new Date(today);
                pastDate.setDate(today.getDate() - i);
                datesList.push(pastDate.toISOString().split('T')[0]);
            }
            setDates(datesList);
        };

        generateDates();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const day = {
            date: date,
            rating: rating,
            type: type,
            userEmail: Cookies.get('email')
        };
console.log(day);
        axios
            .post('http://localhost:8080/day', day, {
                headers: {
                    Authorization: `${Cookies.get('token') || ''}`
                }
            })
            .catch(error => {
                console.error("Error submitting data:", error);
            });
    };

    return (
        <div className="manual">
            <h2>Manual Form</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="rating">Rating:</label>
                <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
                    <option value="" disabled>
                        Select a rating
                    </option>
                    <option value="1">Low</option>
                    <option value="2">Medium</option>
                    <option value="3">Good</option>
                    <option value="4">High</option>
                </select>

                <label htmlFor="table">Table:</label>
                <select id="table" value={table} onChange={(e) => setType(e.target.value)}>
                    <option value="" disabled>
                        Select a table
                    </option>
                    {table.map((name, index) => (
                        <option key={index} value={name}>
                            {name}
                        </option>
                    ))}
                </select>

                <label htmlFor="date">Date:</label>
                <select id="date" value={date} onChange={(e) => setDate(e.target.value)}>
                    <option value="" disabled>
                        Select a date
                    </option>
                    {dates.map((date, index) => (
                        <option key={index} value={date}>
                            {date}
                        </option>
                    ))}
                </select>

                <button type="submit" className="submit-btn">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default Manual;
