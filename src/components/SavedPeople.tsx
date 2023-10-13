import storage from '/src/modules/storage';
import {Fragment, useState} from "react";

function SavedPeople() {
    let savedGroups = [];
    storage.retrieve('saved_people', function (savedPeople) {
        for (let name of Object.keys(savedPeople)) {
            let people = savedPeople[name];
            let sample = people.slice(0, 3).map(function (person) {
                return person.name;
            }).join(', ');
            savedGroups.push({name: name, people: people, sample: sample});
        }
    }, {});

    const [previews, setPreviews] = useState({});

    return (
        <>
            <h2>Saved Lists:</h2>
            <table className="table table-striped">
                <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Sample</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {
                    savedGroups.map((group, index) => (
                            <Fragment key={index}>
                                <tr>
                                    <td>{group.people.count}</td>
                                    <td><a href="#" className='start-with-saved' data-name={group.name}>{group.name}</a></td>
                                    <td>{group.sample}</td>
                                    <td>
                                        <button className="btn btn-primary rename-saved" data-name={group.name}>Rename</button>
                                    </td>
                                    <td>
                                        <button className="btn btn-primary" onClick={() => { setPreviews({...previews, [group.name]: !previews[group.name] }) }} data-name={group.name}>
                                            { previews[group.name] ? 'Hide Preview' : 'Preview' }
                                        </button>
                                    </td>
                                    <td>
                                        <button className="btn btn-danger clear-saved" data-name={group.name}>Delete</button>
                                    </td>
                                </tr>
                                {
                                    previews[group.name] ?
                                        (
                                            <tr>
                                                <td colSpan="5" className="saved-preview">
                                                    {
                                                        group.people.map((person, index) => (
                                                            <img key={index} src={person.photo} title={person.name} className="preview" />
                                                        ))
                                                    }
                                                </td>
                                            </tr>
                                        ) : null
                                }

                            </Fragment>
                        )
                    )
                }
                </tbody>
            </table>
            <button className="btn btn-primary clear-saved">Clear Saved Lists</button>
        </>
    )
}

export default SavedPeople