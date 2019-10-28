/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as monaco from 'monaco-editor-core';
import * as mode from './jsonMode';

import Emitter = monaco.Emitter;
import IEvent = monaco.IEvent;
import IDisposable = monaco.IDisposable;

// --- JSON configuration and defaults ---------

export class LanguageServiceDefaultsImpl implements monacoLanguagesJson.LanguageServiceDefaults {

	private _onDidChange = new Emitter<monacoLanguagesJson.LanguageServiceDefaults>();
	private _diagnosticsOptions: monacoLanguagesJson.DiagnosticsOptions;
	private _languageId: string;

	constructor(languageId: string, diagnosticsOptions: monacoLanguagesJson.DiagnosticsOptions) {
		this._languageId = languageId;
		this.setDiagnosticsOptions(diagnosticsOptions);
	}

	get onDidChange(): IEvent<monacoLanguagesJson.LanguageServiceDefaults> {
		return this._onDidChange.event;
	}

	get languageId(): string {
		return this._languageId;
	}

	get diagnosticsOptions(): monacoLanguagesJson.DiagnosticsOptions {
		return this._diagnosticsOptions;
	}

	setDiagnosticsOptions(options: monacoLanguagesJson.DiagnosticsOptions): void {
		this._diagnosticsOptions = options || Object.create(null);
		this._onDidChange.fire(this);
	}
}

const diagnosticDefault: monacoLanguagesJson.DiagnosticsOptions = {
	validate: true,
	allowComments: true,
	schemas: [],
    enableSchemaRequest: false
};

const jsonDefaults = new LanguageServiceDefaultsImpl('json', diagnosticDefault);


// // Export API
// function createAPI(): typeof monacoLanguagesJson {
// 	return {
// 		jsonDefaults: jsonDefaults,
// 	}
// }
// monaco.languages.json = createAPI();

// --- Registration to monaco editor ---

function getMode(): Promise<typeof mode> {
	return import('./jsonMode');
}

monaco.languages.register({
	id: 'json',
	extensions: ['.json', '.bowerrc', '.jshintrc', '.jscsrc', '.eslintrc', '.babelrc', '.har'],
	aliases: ['JSON', 'json'],
	mimetypes: ['application/json'],
});

export function setJsonLanguage() {
	getMode().then(mode => mode.setupMode(jsonDefaults));
}
