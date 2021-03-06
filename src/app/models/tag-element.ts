/// <summary>
///     A interface representing the displayed adi.
/// </summary>
export interface TagElement {

    name: string;
    dataType: string;
    elements: number;
    direction: string;
    startAddress: number;
    endAddress: number;
    nodeID: number;

}
