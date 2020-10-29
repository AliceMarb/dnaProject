import React from 'react';

const TransitionsTable = (props) => {
    var array = Object.entries(props.transitions);
    return (
        <div>
            {/* <h3>Hello I am the transitions table </h3> */}
            <table>
                <tbody>
                    <tr>
                        <th>Transition   </th>
                        <th># in encoded file</th>
                    </tr>
                    {
                        array.sort((a, b) => a[0] > b[0] ? 1 : -1)
                            .map((pair) => {
                                return (
                                    <tr key={pair[0]}>
                                        <td>{pair[0]}</td>
                                        <td>{pair[1]}</td>
                                    </tr>);
                            }
                            )}
                </tbody>
            </table>
        </div>
    );
}


export default TransitionsTable;
