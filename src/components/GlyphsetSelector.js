import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import { STATUS } from '../const';
import { fetchGlyphsets, selectGlyphsetByTitle } from '../slices/glyphsetSlice';

export const option = value => ({value, label: value});

const GlyphsetSelector = ({ onChange, disabled, style }) => {
    const glyphset = useSelector(state => state.glyphset);
    const dispatch = useDispatch();

    const glyphsetOptionList = glyphset.status !== STATUS.OK
        ? [option(glyphset.status)]
        : (glyphset.all || []).map(item => option(item.title));

    const glyphsetOptionCurrent = glyphset.status !== STATUS.OK
        ? glyphsetOptionList[0]
        : glyphsetOptionList.find(option => glyphset.current && glyphset.current.title === option.label);

    return <Select
        value = {glyphsetOptionCurrent}
        onChange = {value => {
            dispatch(selectGlyphsetByTitle(value));
            if (onChange !== undefined) {
                onChange(value);
            }
        }}
        options = {glyphsetOptionList}
        isDisabled = {disabled || glyphset.status !== STATUS.OK}
        styles = {{
            input: styles => ({...styles, ...style})
        }}
    />;
};

export default GlyphsetSelector;