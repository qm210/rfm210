import React from 'react';
import MatrixView from './MatrixView';
import LogView from './LogView';
import ExportView from './ExportView';
import ControlPanel from './ControlPanel';
import KerningPanel from './KerningPanel';
import {MainView, MainColumn} from '.';

const GlyphApp = () => {
    return (
        <MainView>
            <MainColumn>
                <MatrixView/>
                <LogView/>
            </MainColumn>
            <MainColumn width='40vw'>
                <ControlPanel/>
            </MainColumn>
            <MainColumn width = '15vw'>
                <KerningPanel/>
            </MainColumn>
            <MainColumn>
                <ExportView/>
            </MainColumn>
        </MainView>
    );
};

export default GlyphApp;