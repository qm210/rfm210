import React from 'react';
import MatrixPixel from '../components/MatrixPixel';

const MatrixRow = ({row, values}) =>
    <div
        style={{
            display: "flex",
            flexDirection: "row",
        }}>
    {
        values.map((value, column) =>
            <MatrixPixel
                key = {column}
                coord = {{row, column}}
            />
        )
    }
    </div>;

export default MatrixRow;
