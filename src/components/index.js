import React from 'react';
import styled from 'styled-components';

export const MainView = styled.div`
    display: flex;
    flex-direction: row;
`

export const MainColumn = styled.div`
    display: flex;
    flex-direction: column;
    padding: 10px;
`


export const ExportList = styled.div`
    display: flex;
    flex-direction: column;
    alignItems: left;
    margin: 10px;
    padding: 10px;
    border: 1px solid #888;
`;

export const SpacedInput = styled.input`
    margin: 10px;
    width: 45px;
    font-size: 1.2em;
`;

export const LabelledInput = (props) => <>
    <label htmlFor={props.name}>{props.label}</label>
    <SpacedInput {...props}/>
</>;

export const ExportTextArea = styled.textarea`
    resize: none;
    width: 321px;
    height: 180px;
    margin: 10px;
    font-size: 9.5px;
`

export const ErrorLabel = styled.span`
    margin-left: 10px;
    color: red;
    font-weight: bold;
    font-size: 18px;
`