import * as monacoEditor from "monaco-editor-core";
import "./index.css";
import { setJsonLanguage } from './languages/json/monaco.contribution';

// @ts-ignore
self.MonacoEnvironment = {
  getWorkerUrl: function(moduleId, label) {
    return "./json.worker.bundle.js";
  }
};

// create Monaco editor
const value = `{
  "$schema": "http://json.schemastore.org/coffeelint",
  "line_endings": "uni1x"
}`;


setJsonLanguage();

var editor = monacoEditor.editor.create(document.body, {
  model: monacoEditor.editor.createModel(value, 'json', monacoEditor.Uri.parse('inmemory://model1.json')),
  value: value,
  language: 'json'
});