import { useEffect, useState } from "react";
import '../style/Table.scss';
import Cookies from "js-cookie";
import axios from "axios";
import { startOfYear, eachDayOfInterval, format, getDay } from "date-fns";

const SpiritualLifeTable = () => {
    const [data, setData] = useState([]);
    const [yearData, setYearData] = useState([]);

    useEffect(() => {
        const fetchStudyDays = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/spiritualLife?email=${Cookies.get('email')}`, {
                    headers: {
                        'Authorization': `${Cookies.get('token') ? Cookies.get('token') : null}`
                    }
                });
                setData(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching study days:", error);
            }
        };

        fetchStudyDays();

        const start = startOfYear(new Date());
        const end = new Date(start);
        end.setFullYear(start.getFullYear() + 1);
        const days = eachDayOfInterval({ start, end: end });
        setYearData(days.map(day => ({
            date: format(day, 'yyyy-MM-dd'),
            rating: 0,
            dayOfWeek: getDay(day)
        })));
    }, []);

    const getDayClass = (rating) => {
        if (rating === 4) return 'high';
        if (rating === 3) return 'good';
        if (rating === 2) return 'medium';
        if (rating === 1) return 'low';
        return 'none';
    };

    const renderDays = () => {
        const mergedData = yearData.map(day => {
            const found = data.find(d => d.date === day.date);
            return found ? { ...found, dayOfWeek: day.dayOfWeek } : { ...day, rating: 0 };
        });

        return mergedData.map((day, index) => (
            <div
                key={index}
                className={`day ${getDayClass(day.rating)}`}
                title={`${day.date} | Rating: ${day.rating}`}
                style={{ gridColumn: Math.ceil((index + 1) / 7), gridRow: (index % 7) + 2 }}
            ></div>
        ));
    };

    const handleRatingChange = async (rating) => {
        const day = {
            date: format(new Date(), 'yyyy-MM-dd'),
            rating: rating,
            type: 'spiritual',
            userEmail: Cookies.get('email')
        };

        try {
            await axios.post('http://localhost:8080/spiritualLife', day, {
                headers: {
                    'Authorization': `${Cookies.get('token') ? Cookies.get('token') : null}`
                }
            });
            const response = await axios.get(`http://localhost:8080/spiritualLife?email=${Cookies.get('email')}`, {
                headers: {
                    'Authorization': `${Cookies.get('token') ? Cookies.get('token') : null}`
                }
            });
            setData(response.data);
        } catch (error) {
            console.error("Error submitting rating:", error);
        }
    };

    return (
        <div className="studyDay-table">
            <h1>Spiritual Life</h1>
            <div className="days-grid">
                {renderDays()}
            </div>
            <h1>How did you grow up spiritually today?</h1>
            <div className="todaysRating">
                <div className="rating-low" onClick={() => handleRatingChange(1)}></div>
                <div className="rating-medium" onClick={() => handleRatingChange(2)}></div>
                <div className="rating-good" onClick={() => handleRatingChange(3)}></div>
                <div className="rating-high" onClick={() => handleRatingChange(4)}></div>
            </div>
        </div>
    );
}

export default SpiritualLifeTable;
