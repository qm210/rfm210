import React from 'react';
import styled from 'styled-components';
import { Segment } from 'semantic-ui-react';

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

export const LabelledInput = (props) => {
    let extraStyle = {};
    if (props.type === "number") {
        extraStyle.width = 60;
    }
    return <>
        <label htmlFor={props.name} style={{whiteSpace: 'nowrap'}}>{props.label}</label>
        <SpacedInput
            {...props}
            style={{
                ...props.style,
                ...extraStyle,
            }}
        />
    </>
};

export const ExportTextArea = styled.textarea`
    resize: none;
    width: 321px;
    height: 180px;
    margin: 10px;
    font-size: 9.5px;
`;

export const ErrorLabel = styled.span`
    margin-left: 10px;
    color: red;
    font-weight: bold;
    font-size: 18px;
`;

export const QuickButton = styled.button`
    height: 40px;
    min-width: 40px;
    font-size: 20px;
    font-weight: bold;
    margin-left: 4px;
    padding: 3px 8px 8px;
`;

export const ButtonBar = styled.div`
    display: flex;
    flex-direction: row;
    margin-top: 15px;
    margin-bottom: 15px;
`;

export const ShaderFrame = styled.div`
    display: flex;
    flex-direction: column;
    alignItems: left;
    margin: 10px;
    padding: 10px;
    border: 1px solid #888;
`;

export const CodeFrame = (props) =>
    <div style={{height: 1200, border: "1px solid grey"}}>
        <textarea
            style={{
                width: '100%',
                height: '100%',
                fontSize: '.9rem',
                overflow: 'scroll',
            }}
            disabled
            value={props.children}
        />
    </div>;

export const GenericList = styled.div`
    display: flex;
    flex-direction: column;
    alignItems: left;
    margin: 10px;
    padding: 10px;
    border: 1px solid #888;
`;

export const Button = styled.button`
    margin: 10px;
    padding: 10px;
`;

export const DebugSegment = ({obj}) =>
    <Segment style={{display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
    {
        Object.entries(obj).map(([key, val]) =>
            <React.Fragment key={key}>
                <div>{key}:</div>
                <div>{val !== null ? val.toString() : "null"}</div>
            </React.Fragment>
        )
    }
    </Segment>;