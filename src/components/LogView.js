import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import RectAlgebra from '../RectAlgebra';

const mapStateToProps = (state) => ({
    pixels: state.Pixel.pixels
});

const LogList = styled.div`
    display: flex;
    flex-direction: column;
    align-items: left;
    margin: 10px 20px;
    width: 300px;
    font-size: 14px;
`

const RectInfoLabel = ({index, item: rect}) =>
    <span>
        {index + 1}. Rect({rect.fromColumn}, {rect.fromRow}, {rect.toColumn}, {rect.toRow}) [size: {rect.size()}]
    </span>;

const PixelInfoLabel = ({index, item: pixel}) =>
    <span>
        {index + 1}. Rect({pixel.row}, {pixel.column}, {pixel.row + 1}, {pixel.column + 1})
    </span>;

const NoneLabel = () => <span style={{color: "#AAA"}}>None</span>;

const RectList = ({collection, ItemClass, label}) => {
    return <>
    <b>{label}:</b>
    {
        collection.length === 0 ? <NoneLabel/> :
        collection.map((item, index) => <ItemClass key={index} index={index} item={item}/>)
    }
    <br/>
    </>;
};


const LogView = ({pixels}) => {
    const [allRects, orphanPixels] = RectAlgebra.getAllRectsAndOrphanPixels(pixels);
    const sufficientRects = RectAlgebra.getSufficientRects(pixels, allRects, orphanPixels);
    return <LogList>
        <RectList collection={sufficientRects} ItemClass={RectInfoLabel} label="Sufficient Rects"/>
        <RectList collection={orphanPixels} ItemClass={PixelInfoLabel} label="Orphan Pixels"/>
        <RectList collection={allRects} ItemClass={RectInfoLabel} label="All Rects"/>
    </LogList>;
};

export default connect(mapStateToProps)(LogView);
