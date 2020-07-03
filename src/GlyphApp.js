import React from 'react';
import MatrixView from './components/MatrixView';
import LogView from './components/LogView';
import ExportView from './components/ExportView';
import ControlPanel from './components/ControlPanel';
import {MainView, MainColumn} from './components';

const GlyphApp = () =>
    <>
        <MainView>
            <MainColumn>
                <MatrixView/>
                <LogView/>
            </MainColumn>
            <MainColumn>
                <ControlPanel/>
            </MainColumn>
            <MainColumn>
                {/*<ShaderView/> // this is not perfomant enough yet, sorry nobody */}
                <ExportView/>
            </MainColumn>
        </MainView>
    </>;

export default GlyphApp;
