import React, { Component } from "react";
import axios from 'axios';

class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    };

    componentDidMount(){
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues() {
        // GET req for the REST route for the values
        const values = await axios.get('/api/values/current');

        // Setting the state
        this.setState({values: values.data })

    }

    async fetchIndexes() {
        const seenIndexes = await axios.get('/api/values/all');

        this.setState({
            seenIndexes: seenIndexes.data
        })
    }

    
}