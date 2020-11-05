import React from 'react';
import MatrixPixel from '../components/MatrixPixel';

export default ({row, values}) =>
    <div
        style={{
            display: "flex",
            flexDirection: "row",
        }}>
    {
        values.map((_, column) =>
            <MatrixPixel
                key = {column}
                coord = {{row, column}}
            />
        )
    }
    </div>;
