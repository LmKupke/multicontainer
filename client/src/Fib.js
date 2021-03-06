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


    handleSubmit = async (event) => {
        event.preventDefault();

        await axios.post('/api/value', {
            index: this.state.index
        });

        this.setState({ index: ''});
    }

    renderSeenIndexes() {
        return this.state.seenIndexes.length > 0 ? this.state.seenIndexes.map(({number}) => number).join(', ') : null;
    }

    renderValues() {
        const entries = [];
        if (!this.state.values.isEmpty()) {
            for (let key in this.state.values) {
                entries.push(
                    <div key={'render-' + key}>
                        For index {key} I calculated {this.state.values[key]}
                    </div>
                );
            }
        }
        return entries;
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter you index:</label>
                    
                    <input
                        value={this.state.index}
                        onChange={event => this.setState({ index: event.target.value})}
                    />
                    
                    <button>Submit</button>
                </form>
                <h3>Indexes I have seen:</h3>
                    {this.renderSeenIndexes()}

                <h3>Calculated Values:</h3>
                    {this.renderValues()}
            </div>
        );
    }
}

export default Fib;