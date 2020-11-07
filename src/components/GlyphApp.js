import React from 'react';
import MatrixView from './MatrixView';
import LogView from './LogView';
import ExportView from './ExportView';
import ControlPanel from './ControlPanel';
import {MainView, MainColumn} from '.';

export default () => {
    return (
        <MainView>
            <MainColumn>
                <MatrixView/>
                <LogView/>
            </MainColumn>
            <MainColumn>
                <ControlPanel/>
            </MainColumn>
            <MainColumn>
                <ExportView/>
            </MainColumn>
        </MainView>
    );
};
