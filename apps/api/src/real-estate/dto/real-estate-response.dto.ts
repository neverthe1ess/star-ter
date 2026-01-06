export class RealEstateResponseDto {
  id: string;
  name: string | null;
  address: string | null;
  roadaddress: string | null;
  centerlatitude: number | null;
  centerlongitude: number | null;
  title: string | null;
  deposit: number | null;
  monthlyrent: number | null;
  maintenancefee: number | null;
  premium: number | null;
  areaprice: number | null;
  size: number | null;
  floor: number | null;
  groundfloor: number | null;
  businesslargecodename: string | null;
  businessmiddlecodename: string | null;
  nearsubwaystation: string | null;
  ismoveindate: boolean | null;
  previewphotourl: string | null;
}
