import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ConfigurationService } from './configuration.service';
import { ApplicationDataInstance } from 'src/app/models/application-data-instance';


@Injectable({
  providedIn: 'root'
})
export class ConfigurationXmlService {
  private   ValueAttribute = "Value";
  private   RootElement : string = "Configuration";
  private   CreatedAttribute : string = "Created";
  private   EnabledProtocolElement : string = "EnabledProtocol";
  private   ProtocolElement : string = "Protocol";
  private   OpcAttributeValue :string = "OPC-UA";
  private   MqttAttributeValue :string = "MQTT";
  private   OpcElement :string = "OpcUa";
  private   OpcUANamespaceUriElement : string = "AppLocalNamespaceURI";
  private   ApplicationDataObjectElement :string = "AbccObject";
  private   ObjectNbrElement: string = "ObjectNbr";
  private   ApplicationDataObjectNbrAttributeValue : string = "0xFE";
  private   AdiElement : string = "AbccInstance";
  private   AdiNumberElement :string = "InstanceNbr";
  private   NameElement :string = "Name";
  private   NbrOfElementsElement:string = "NumberOfElements";
  private   BitOffsetElement: string = "BitOffsetDataToIIOT";
  private   NumberOfBitsInByte: number = 8;
  private   BaseElementElement :string  = "Element";
  private   DataTypeElement :string = "DataType";
  private   DescriptorElement :string = "Descriptor";
  private   NbrOfSubelementsElement :string = "NumberOfSubelements";
  private   NoSubelementsValue: string = "0";
    
  constructor(public timePipe: DatePipe){

  }
  private generateDateNow(): string{
      var date = new Date();
      return this.timePipe.transform(date, 'yyyy-MM-dd hh:mm:ss');
  }

  private CreateXml(configuration : ConfigurationService ,  xmlDocument : Document){
      var rootXmlElement = xmlDocument.createElement(this.RootElement);
      rootXmlElement.setAttribute(this.CreatedAttribute, this.generateDateNow());
      xmlDocument.appendChild(rootXmlElement);
      var protocolXmlElement = xmlDocument.createElement(this.EnabledProtocolElement);
      rootXmlElement.appendChild(protocolXmlElement);
      var protocolValueXmlElement = xmlDocument.createElement(this.ProtocolElement);
      if (configuration.getProtocol() === 'opc-ua'/* == Protocol.OpcUA*/)
      {
          protocolValueXmlElement.setAttribute(this.ValueAttribute, this.OpcAttributeValue);
          protocolXmlElement.appendChild(protocolValueXmlElement);
      }
      else
      {
          protocolValueXmlElement.setAttribute(this.ValueAttribute, this.MqttAttributeValue);
          protocolXmlElement.appendChild(protocolValueXmlElement);
      }
      var opcUAXmlElement = xmlDocument.createElement(this.OpcElement);
      rootXmlElement.appendChild(opcUAXmlElement);
      var opcUAValueXmlElement = xmlDocument.createElement(this.OpcUANamespaceUriElement);
      opcUAValueXmlElement.setAttribute(this.ValueAttribute, configuration.getOpcUANamespaceUri());
      opcUAXmlElement.appendChild(opcUAValueXmlElement);
      this.CreateApplicationDataObjectXml(configuration, rootXmlElement, xmlDocument);
  }
  private CreateApplicationDataObjectXml(configuration : ConfigurationService , parent: HTMLElement, xmlDocument : XMLDocument){
      var applicationDataObjectXmlElement = xmlDocument.createElement(this.ApplicationDataObjectElement);
      parent.appendChild(applicationDataObjectXmlElement);
      var objectNbrXmlElement = xmlDocument.createElement(this.ObjectNbrElement);
      objectNbrXmlElement.setAttribute(this.ValueAttribute, this.ApplicationDataObjectNbrAttributeValue);
      applicationDataObjectXmlElement.appendChild(objectNbrXmlElement);
      for (let adi of configuration.getAdiList()/*applicationDataObject.AdiList*/) {
          this.CreateApplicationDataInstanceXml(adi, applicationDataObjectXmlElement, xmlDocument);
      }
  }

  private CreateApplicationDataInstanceXml(adi : ApplicationDataInstance, parent : HTMLElement, xmlDocument :XMLDocument){
      var adiXmlElement = xmlDocument.createElement(this.AdiElement);
      parent.appendChild(adiXmlElement);
      var adiNumberXmlElement = xmlDocument.createElement(this.AdiNumberElement);
      adiNumberXmlElement.setAttribute(this.ValueAttribute, adi.getAdiNumber().toString()); //adi.AdiNumber.Value.ToString(/*CultureInfo.InvariantCulture*/
      adiXmlElement.appendChild(adiNumberXmlElement);
      var nameXmlElement = xmlDocument.createElement(this.NameElement);
      nameXmlElement.setAttribute(this.ValueAttribute, adi.getName() );//adi.Name
      adiXmlElement.appendChild(nameXmlElement);
      var nbrOfElementsXmlElement = xmlDocument.createElement(this.NbrOfElementsElement);
      nbrOfElementsXmlElement.setAttribute(
          this.ValueAttribute,
          adi.getNumberOfElements().toString());//adi.Element.GetElementInformation().Count().ToString(/*CultureInfo.InvariantCulture*/)
      adiXmlElement.appendChild(nbrOfElementsXmlElement);
      var offsetXmlElement = xmlDocument.createElement(this.BitOffsetElement);
      offsetXmlElement.setAttribute(this.ValueAttribute, (adi.getOffset() * this.NumberOfBitsInByte).toString())//.ToString(/*CultureInfo.InvariantCulture*/));
      adiXmlElement.appendChild(offsetXmlElement);
      this.CreateElementXml(adi, adiXmlElement, xmlDocument);
  }

  private CreateElementXml(adi : ApplicationDataInstance, parent : HTMLElement, xmlDocument:XMLDocument)
  {
      var baseElementXmlElement = xmlDocument.createElement(this.BaseElementElement);
      parent.appendChild(baseElementXmlElement);
      var dataTypeXmlElement = xmlDocument.createElement(this.DataTypeElement);
      dataTypeXmlElement.setAttribute(
          this.ValueAttribute,
          adi.getDataType().toString());//GetElementInformation().First().DataType.TypeId.ToString(/*CultureInfo.InvariantCulture*/
      baseElementXmlElement.appendChild(dataTypeXmlElement);
      var descriptorXmlElement = xmlDocument.createElement(this.DescriptorElement);
      descriptorXmlElement.setAttribute(
          this.ValueAttribute,
          adi.getAccessRights().toString());//((Number)(element.GetElementInformation().First().AccessRights)).ToString(/*CultureInfo.InvariantCulture*/)
      baseElementXmlElement.appendChild(descriptorXmlElement);
      var nbrOfSubelementsXmlElement = xmlDocument.createElement(this.NbrOfSubelementsElement);
      //Do If satement
      nbrOfSubelementsXmlElement.setAttribute(
          this.ValueAttribute,
          adi.getNumberOfSubelements() === 0 ? this.NoSubelementsValue : adi.getNumberOfSubelements().toString());//GetElementInformation().First().NumberOfSubelements?.ToString(/*CultureInfo.InvariantCulture*/)
      baseElementXmlElement.appendChild(nbrOfSubelementsXmlElement);
  }

  public CreateConfigurationXml(configuration : ConfigurationService, filePath : string)
  {
      //created DOM object
      let xmlDocument  = document.implementation.createDocument("","",null)
      this.CreateXml(configuration, xmlDocument);
      
      var xmlSerializer = new XMLSerializer();
      //xml inside a string
      var sXML = xmlSerializer.serializeToString(xmlDocument);

     // xmlDocument.Save(filePath);
  }

}