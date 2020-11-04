import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import RectAlgebra from '../RectAlgebra';

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

const LogView = () => {
    const glyph = useSelector(state => state.glyph.current);
    const [onceClicked, setOnceClicked] = React.useState(false);

    if (!glyph) {
        return null;
    }
    const pixels = glyph.pixels;
    const [allRects, orphanPixels] = RectAlgebra.getAllRectsAndOrphanPixels(pixels);
    const sufficientRects = RectAlgebra.getSufficientRects(pixels, allRects, orphanPixels);
    return <LogList>
        {
            onceClicked
            ? <>
                <RectList collection={sufficientRects} ItemClass={RectInfoLabel} label="Sufficient Rects"/>
                <RectList collection={orphanPixels} ItemClass={PixelInfoLabel} label="Orphan Pixels"/>
                <RectList collection={allRects} ItemClass={RectInfoLabel} label="All Rects"/>
            </>
            : <button onClick={() => setOnceClicked(true)}>Show Rect Information</button>
        }
    </LogList>;
};

export default LogView;
