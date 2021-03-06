import React from 'react';
import styled from 'styled-components';
import { Segment } from 'semantic-ui-react';

export const MainView = styled.div`
    display: flex;
    flex-direction: row;
    overflow-y: hidden;
`

export const MainColumn = styled.div`
    display: flex;
    flex-direction: column;
    padding: 10px;
    overflow-y: scroll;
    width: ${props => props.width};
    height: calc(100vh - 32px);
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
    margin: 10px 3px;
    padding: 3px;
    border: 1px solid grey;
    border-radius: 2px;
    font-size: 1rem;
`;

export const LabelledInput = (props) => {
    let extraStyle = {};
    if (props.type === "number") {
        extraStyle.width = 60;
    }
    return <div>
        {
            props.type !== "checkbox" &&
            <label htmlFor={props.name} style={{whiteSpace: 'nowrap'}}>{props.label}</label>
        }
        <SpacedInput
            {...props}
            id = {props.name}
            style={{
                ...props.style,
                ...extraStyle,
            }}
        />
        {
            props.type === "checkbox" &&
            <label htmlFor={props.name} style={{whiteSpace: 'nowrap'}}>{props.label}</label>
        }
    </div>
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
    margin-top: 0px;
    margin-bottom: 5px;
`;

export const ShaderFrame = styled.div`
    display: flex;
    flex-direction: column;
    alignItems: left;
    margin: 10px;
    padding: 10px;
    border: 1px solid #888;
`;

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