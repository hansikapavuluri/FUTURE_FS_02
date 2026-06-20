    import React, { useState } from 'react';
    import "../styles/Contact.css";
    import axios from 'axios';

    const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (event) => {
        setFormData({
        ...formData,
        [event.target.name]: event.target.value
        });
    };

    const handleClick = async (e) => {
        e.preventDefault();
        try {
        await axios.post("http://localhost:5000/api/leads", formData);
    



        // notify dashboard that a new lead was added
        localStorage.setItem("newLeadAdded", Date.now());

        setIsFormSubmitted(true);
        setErrorMessage("");
        setFormData({ name: "", email: "", message: "" });

        setTimeout(() => setIsFormSubmitted(false), 2000);
        } catch (err) {
        console.error("Error submitting lead:", err);
        setErrorMessage("Failed to submit. Please try again later.");
        }
    };

    return (
        <section className='Contact-section'>
        <form onSubmit={handleClick} className='contact-form'>
            <h1 className='title'>Contact Form</h1>
            <input 
            type="text" 
            name="name"
            value={formData.name}
            className='name'
            placeholder='Enter Name'
            required
            onChange={handleChange}
            />
            <input 
            type="email" 
            name="email"
            value={formData.email}
            className='email'
            placeholder='Enter Email'
            required
            onChange={handleChange}
            />
            <textarea 
            name="message" 
            value={formData.message}
            className='message'
            placeholder='Enter Message'
            required
            onChange={handleChange}
            ></textarea>
            <button type='submit' className='submit-btn'>Submit</button>

            {isFormSubmitted && <p className="success">✅ Form submitted!</p>}
            {errorMessage && <p className="error">❌ {errorMessage}</p>}
        </form>
        </section>
    );
    };

    export default Contact;
