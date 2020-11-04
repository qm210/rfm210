import React from 'react';
import MatrixView from './components/MatrixView';
import LogView from './components/LogView';
import ExportView from './components/ExportView';
import ControlPanel from './components/ControlPanel';
import {MainView, MainColumn} from './components';

const GlyphApp = () => {
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

export default GlyphApp;
