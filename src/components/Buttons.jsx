import React, { useState } from 'react';
import root from '../root';
import '../style/Buttons.scss';
import '../style/AddTable.scss';
import Cookies from "js-cookie";
import Login from './Login';
import Header from './Header';
import axios from 'axios';

const AddTableForm = ({setUpdatedTables, setShowAddTableWindow}) => {
    const [name, setName] = useState('');
    const [question, setQuestion] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const table = {
            name: name,
            question: question,
            userEmail: Cookies.get('email')
        };

        try {
            await axios.post('http://localhost:8080/table', table, {
                headers: {
                    'Authorization': `${Cookies.get('token') ? Cookies.get('token') : null}`
                }
            })
                .then(response => {
                    setUpdatedTables(response.data);
                });

            setShowAddTableWindow(false);
            setName('');
            setQuestion('');
            setError('');
        } catch (err) {
            setError('Error submitting the form. Please try again.');
            console.error("Error submitting table:", err);
        }
    };

    return (
        <div className="addTable">
            <h1>Add Table</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Table name:</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                <label htmlFor="question">Table question:</label>
                <input id="question" type="text" value={question} onChange={(e) => setQuestion(e.target.value)} required />
                <button type="submit" className="submitButton">Save</button>
            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

const Buttons = ({setUpdatedTables}) => {
    const [showAddTableWindow, setShowAddTableWindow] = useState(false);
    
    const handleLogOutClick = () => {
        Cookies.remove('email');
        Cookies.remove('password');
        Cookies.remove('token');

        root.render(
            <React.StrictMode>
                <Header/>
                <Login/>
            </React.StrictMode>
        );
    };

    return (
        <>
            <div className="buttons">
                <div className='btns'>
                    <button className="addTableButton" onClick={() => setShowAddTableWindow(!showAddTableWindow)}>Add Table</button>
                    <button className='logOutButton' onClick={handleLogOutClick}>Log Out</button>
                </div>
                <p>Made with <span className='redHeart'>&#10084;</span> by <a href='https://portfoliodanielabulashvili.netlify.app/' target='_blank'>Daniel</a></p>
            </div>
            {showAddTableWindow && (
                <AddTableForm setUpdatedTables={setUpdatedTables} setShowAddTableWindow={setShowAddTableWindow}/>
            )}
        </>
    );
}

export default Buttons;
