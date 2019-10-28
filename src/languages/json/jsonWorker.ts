/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as monaco from 'monaco-editor-core';

import Thenable = monaco.Thenable;
import IWorkerContext = monaco.worker.IWorkerContext;

import * as jsonService from 'vscode-json-languageservice';
import * as ls from 'vscode-languageserver-types';

let defaultSchemaRequestService;
if (typeof fetch !== 'undefined'){
	defaultSchemaRequestService = function (url) { return fetch(url).then(response => response.text())};
}

console.log('work from json')

class PromiseAdapter<T> implements jsonService.Thenable<T> {
	private wrapped: Promise<T>;

	constructor(executor: (resolve: (value?: T | jsonService.Thenable<T>) => void, reject: (reason?: any) => void) => void) {
		this.wrapped = new Promise<T>(executor);
	}
	public then<TResult>(onfulfilled?: (value: T) => TResult | jsonService.Thenable<TResult>, onrejected?: (reason: any) => void): jsonService.Thenable<TResult> {
		let thenable: jsonService.Thenable<T> = this.wrapped;
		return thenable.then(onfulfilled, onrejected);
	}
	public getWrapped(): monaco.Thenable<T> {
		return this.wrapped;
	}
	public static resolve<T>(v: T | Thenable<T>): jsonService.Thenable<T> {
		return <monaco.Thenable<T>>Promise.resolve(v);
	}
	public static reject<T>(v: T): jsonService.Thenable<T> {
		return Promise.reject(<any>v);
	}
	public static all<T>(values: jsonService.Thenable<T>[]): jsonService.Thenable<T[]> {
		return Promise.all(values);
	}
}

export class JSONWorker {

	private _ctx: IWorkerContext;
	private _languageService: jsonService.LanguageService;
	private _languageSettings: jsonService.LanguageSettings;
	private _languageId: string;

	constructor(ctx: IWorkerContext, createData: ICreateData) {
		this._ctx = ctx;
		this._languageSettings = createData.languageSettings;
		this._languageId = createData.languageId;
		this._languageService = jsonService.getLanguageService({
			schemaRequestService: createData.enableSchemaRequest && defaultSchemaRequestService,
			promiseConstructor: PromiseAdapter
		});
		this._languageService.configure(this._languageSettings);
	}

	doValidation(uri: string): Thenable<ls.Diagnostic[]> {
		let document = this._getTextDocument(uri);
		if (document) {
			let jsonDocument = this._languageService.parseJSONDocument(document);
			return this._languageService.doValidation(document, jsonDocument);
		}
		return Promise.resolve([]);
	}
	doComplete(uri: string, position: ls.Position): Thenable<ls.CompletionList> {
		let document = this._getTextDocument(uri);
		let jsonDocument = this._languageService.parseJSONDocument(document);
		return this._languageService.doComplete(document, position, jsonDocument);
	}
	doResolve(item: ls.CompletionItem): Thenable<ls.CompletionItem> {
		return this._languageService.doResolve(item);
	}
	doHover(uri: string, position: ls.Position): Thenable<ls.Hover> {
		let document = this._getTextDocument(uri);
		let jsonDocument = this._languageService.parseJSONDocument(document);
		return this._languageService.doHover(document, position, jsonDocument);
	}
	format(uri: string, range: ls.Range, options: ls.FormattingOptions): Thenable<ls.TextEdit[]> {
		let document = this._getTextDocument(uri);
		let textEdits = this._languageService.format(document, range, options);
		return Promise.resolve(textEdits);
	}
	resetSchema(uri: string): Thenable<boolean> {
		return Promise.resolve(this._languageService.resetSchema(uri));
	}
	findDocumentSymbols(uri: string): Thenable<ls.SymbolInformation[]> {
		let document = this._getTextDocument(uri);
		let jsonDocument = this._languageService.parseJSONDocument(document);
		let symbols = this._languageService.findDocumentSymbols(document, jsonDocument);
		return Promise.resolve(symbols);
	}
	findDocumentColors(uri: string): Thenable<ls.ColorInformation[]> {
		let document = this._getTextDocument(uri);
		let stylesheet = this._languageService.parseJSONDocument(document);
		let colorSymbols = this._languageService.findDocumentColors(document, stylesheet);
		return Promise.resolve(colorSymbols);
	}
	getColorPresentations(uri: string, color: ls.Color, range: ls.Range): Thenable<ls.ColorPresentation[]> {
		let document = this._getTextDocument(uri);
		let stylesheet = this._languageService.parseJSONDocument(document);
		let colorPresentations = this._languageService.getColorPresentations(document, stylesheet, color, range);
		return Promise.resolve(colorPresentations);
	}
	provideFoldingRanges(uri: string, context?: { rangeLimit?: number; }): Thenable<ls.FoldingRange[]> {
		let document = this._getTextDocument(uri);
		let ranges = this._languageService.getFoldingRanges(document, context);
		return Promise.resolve(ranges);
	}
	private _getTextDocument(uri: string): ls.TextDocument {
		let models = this._ctx.getMirrorModels();
		for (let model of models) {
			if (model.uri.toString() === uri) {
				return ls.TextDocument.create(uri, this._languageId, model.version, model.getValue());
			}
		}
		return null;
	}
}

export interface ICreateData {
	languageId: string;
	languageSettings: jsonService.LanguageSettings;
    enableSchemaRequest: boolean;
}

export function create(ctx: IWorkerContext, createData: ICreateData): JSONWorker {
	return new JSONWorker(ctx, createData);
}
