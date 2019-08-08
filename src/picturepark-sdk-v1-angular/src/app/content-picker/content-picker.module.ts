import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// LIBRARIES
import {
  ApplicationHeaderModule, BasketModule, ContentAggregationListModule, ChannelPickerModule,
  ContentBrowserModule, SearchBoxModule, SharedModule, LayerPanelsModule
} from '@picturepark/sdk-v1-angular-ui';

// MODULES
import { ContentPickerRoutingModule } from './content-picker-routing.module';

// COMPONENTS
import { ContentPickerComponent } from './content-picker.component';
import { ContentsPickerComponent } from './components/contents-picker/contents-picker.component';

@NgModule({
  declarations: [
    ContentPickerComponent,
    ContentsPickerComponent
  ],
  imports: [
    CommonModule,
    ApplicationHeaderModule,
    ContentPickerRoutingModule,
    SharedModule,
    BasketModule,
    ContentAggregationListModule,
    LayerPanelsModule,
    ChannelPickerModule,
    ContentBrowserModule,
    SearchBoxModule,
  ]
})
export class ContentPickerModule { }