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
                    <tr key={"As"}>
                        <td>GA + CA + TA</td>
                        <td>{props.transitions["GA"] + props.transitions["CA"] + props.transitions["TA"]}</td>
                    </tr>
                    <tr key={"Cs"}>
                        <td>GC + AC + TC</td>
                        <td>{props.transitions["GC"] + props.transitions["AC"] + props.transitions["TC"]}</td>
                    </tr>
                    <tr key={"Gs"}>
                        <td>AG + CG + TG</td>
                        <td>{props.transitions["AG"] + props.transitions["CG"] + props.transitions["TG"]}</td>
                    </tr>
                    <tr key={"Ts"}>
                        <td>GT + CT + AT</td>
                        <td>{props.transitions["GT"] + props.transitions["CT"] + props.transitions["AT"]}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}


export default TransitionsTable;
