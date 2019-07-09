import { Injectable } from '@angular/core';
import {
  CustomerInfo,
  FieldBoolean,
  FieldDate,
  FieldDateTime,
  FieldDateTimeArray,
  FieldDecimal,
  FieldDictionary,
  FieldDictionaryArray,
  FieldGeoPoint,
  FieldLong,
  FieldLongArray,
  FieldMultiFieldset,
  FieldMultiRelation,
  FieldMultiTagbox,
  FieldSingleFieldset,
  FieldSingleRelation,
  FieldSingleTagbox,
  FieldString,
  FieldStringArray,
  FieldTranslatedString,
  SchemaDetail,
} from '@picturepark/sdk-v1-angular';

import * as lodash from 'lodash';
import * as moment_ from 'moment';
const moment = moment_;

import { LocalizationService } from '../localization/localization.service';

@Injectable({
  providedIn: 'root'
})
export class MetaDataPreviewService {
  constructor(private localizationService: LocalizationService) { }

  public prepareTableColumns(allColumnNames: string[], tableData: any[]): string[] {

    const existedColumnsSet = new Set<string>();

    tableData.forEach(data => {
      for (const property of data) {
        existedColumnsSet.add(property);
    }
    });

    const existedColumns = Array.from(existedColumnsSet);
    const intersections = allColumnNames.filter((x: string) => existedColumns.map(i => i.includes(x)));

    return intersections;
  }

  public getContentTableData(metadataItems: any[], schemas: SchemaDetail[], info: CustomerInfo, withId: boolean = true): any[] {
    const allData: any[] = [];

    metadataItems.map(item => {
      const preview = {};
      schemas.forEach(schema => {
        const previewData = this.getPreviewData(schema, item[schema.id], info, withId);
        for (const prop of previewData) {
            preview[`${schema.id}.${prop}`] = previewData[prop];
        }
      });

      if (Object.keys(preview).length) {
        allData.push(preview);
      }
    });

    return allData;
  }

  public getListItemsTableData(metadataItems: any[], schema: SchemaDetail, info: CustomerInfo, withId: boolean = true): any[] {
    return metadataItems.map(data => this.getPreviewData(schema, data, info, withId)).filter(x => Object.keys(x).length > 0);
  }

  private getPreviewData(schema: SchemaDetail, metadata: any, customerInfo: CustomerInfo, withId: boolean = true): any {

    const fields: any = {};

    // tslint:disable-next-line: forin
    for (const fieldId of metadata) {
      if (withId && (fieldId === '_refId' || fieldId === 'id')) {
        fields[fieldId] = metadata[fieldId];
        continue;
      }

      // find field
      const field = schema && schema.fields && schema.fields.filter(fieldData => fieldData.id === fieldId)[0];
      if (lodash.isNil(field)) {
        continue;
      }

      let value;
      const fieldType = field!.constructor;

      if (fieldId.lastIndexOf('.') === -1) {
        value = metadata[fieldId];
      } else {
        const propertyName = lodash.last(fieldId.split('.'));
        if (propertyName && typeof propertyName === 'string') {
            value = metadata[lodash.lowerFirst(schema.id)] ? metadata[lodash.lowerFirst(schema.id)][propertyName] : metadata[propertyName];
        }
      }

      if (lodash.isNil(value)) {
        fields[fieldId] = `${value}`;

      } else if (fieldType === FieldString) {
        fields[fieldId] = value;

      } else if (fieldType === FieldLong
        || fieldType === FieldDecimal
        || fieldType === FieldBoolean) {
        fields[fieldId] = value.toString();

      } else if (fieldType === FieldDate
        || fieldType === FieldDateTime) {
        const format = (field as FieldDate).format || (fieldType === FieldDate ? 'LL' : 'LLL');
        fields[fieldId] = value ? moment.utc(value).format(format) : '';

      } else if (fieldType === FieldTranslatedString) {
        fields[fieldId] = this.localizationService.localize(value, customerInfo);

      } else if (fieldType === FieldGeoPoint
        || fieldType === FieldDictionary) {
        fields[fieldId] = lodash.values(value).join(', ');

      } else if (fieldType === FieldDictionaryArray) {
        fields[fieldId] = value.map((v: any) => lodash.values(v).join(', ')).join(', ');

      } else if (fieldType === FieldDateTimeArray) {
        fields[fieldId] = value.map((v: any) =>
          v ? moment(v).format((field as FieldDate).format || 'LLL') : '').join(', ');

      } else if (fieldType === FieldLongArray
        || fieldType === FieldStringArray) {
        fields[fieldId] = value.join(', ');

      } else if (fieldType === FieldSingleFieldset) {
        fields[fieldId] = value.displayValue ? value.displayValue.name : '';

      } else if (fieldType === FieldMultiFieldset) {

      } else if (fieldType === FieldSingleTagbox) {
        if (value.displayValue) {
          fields[fieldId] = value.displayValue.name;
        }

      } else if (fieldType === FieldMultiTagbox) {
        if (value[0] && value[0].displayValue) {
          fields[fieldId] = value.map((f: any) => f.displayValue ? f.displayValue.name : '').join(', ');
        }
      } else if (fieldType === FieldSingleRelation) {

      } else if (fieldType === FieldMultiRelation) {

      } else {
        console.log('Unsupported field type [' + fieldType + '] encountered.');
      }
    }
    return fields;
  }
}
