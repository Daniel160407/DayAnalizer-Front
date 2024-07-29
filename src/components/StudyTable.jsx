import { useEffect, useState } from "react";
import '../style/StudyTable.scss';
import Cookies from "js-cookie";
import axios from "axios";
import { startOfYear, eachDayOfInterval, format, getDay } from "date-fns";

const StudyTable = () => {
    const [data, setData] = useState([]);
    const [yearData, setYearData] = useState([]);

    useEffect(() => {
        // Fetch study days from the backend
        const fetchStudyDays = async () => {
            try {
                const response = await axios.get('http://localhost:8080/studyday?userId=1', {
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

        // Generate year data
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
            date: format(new Date(), 'yyyy-MM-dd'), // Current date
            rating: rating,
            type: 'study',
            userId: Cookies.get('userId')
        };

        try {
            // Send the rating to the backend
            await axios.post('http://localhost:8080/studyday', day, {
                headers: {
                    'Authorization': `${Cookies.get('token') ? Cookies.get('token') : null}`
                }
            });
            // Re-fetch data to update the UI
            const response = await axios.get('http://localhost:8080/studyday?userId=1', {
                headers: {
                    'Authorization': `${Cookies.get('token') ? Cookies.get('token') : null}`
                }
            });
            setData(response.data); // Update state with the new data
        } catch (error) {
            console.error("Error submitting rating:", error);
        }
    };

    return (
        <div className="studyDay-table">
            <h1>Study Days</h1>
            <div className="days-grid">
                {renderDays()}
            </div>
            <h1>How have you studied today?</h1>
            <div className="todaysRating">
                <div className="rating-low" onClick={() => handleRatingChange(1)}></div>
                <div className="rating-medium" onClick={() => handleRatingChange(2)}></div>
                <div className="rating-good" onClick={() => handleRatingChange(3)}></div>
                <div className="rating-high" onClick={() => handleRatingChange(4)}></div>
            </div>
        </div>
    );
}

export default StudyTable;
