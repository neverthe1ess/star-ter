import { Injectable } from '@nestjs/common';
import { ToolsRepository } from './tools.repository';
import { QueryParams } from './dto/query-dto';

@Injectable()
export class AiToolsService {
  constructor(private readonly toolsRepository: ToolsRepository) {}

  async run(toolName: string, argsJson: string): Promise<unknown> {
    const args: QueryParams = this.parseArgs(argsJson);
    args.stdrYyquCd = args.stdrYyquCd || '20253';
    switch (toolName) {
      case 'get_store':
        return this.toolsRepository.getCommercialSummary(args);
      case 'get_foot_traffic':
        return this.toolsRepository.getFootTrafficSummary(args);
      case 'get_resident_population':
        return this.toolsRepository.getResidentPopulationSummary(args);
      case 'get_working_population':
        return this.toolsRepository.getWorkingPopulationSummary(args);
      case 'get_sales_top_industries':
        return this.toolsRepository.getSalesTopIndustries(args);
      case 'get_store_top_industries':
        return this.toolsRepository.getStoreTopIndustries(args);
      case 'get_income_consumption':
        return this.toolsRepository.getIncomeConsumptionSummary(args);
      case 'get_commercial_change':
        return this.toolsRepository.getCommercialChangeSummary(args);
      case 'compare_commercial_areas':
        return this.toolsRepository.compareCommercialAreas(args);
      case 'get_industry_commercial_summary':
        return this.toolsRepository.getIndustryCommercialSummary(args);
      case 'recommend_commercial_by_industry':
        return this.toolsRepository.recommendCommercialByIndustry(args);
      case 'compare_commercial_by_industry':
        return this.toolsRepository.compareCommercialByIndustry(args);
      case 'recommend_real_estate':
        return this.toolsRepository.getRecommendRealEstate(args);
      case 'get_foot_traffic_timeseries':
        return this.toolsRepository.getFootTrafficTimeSeries(args);
      case 'get_foot_traffic_detail':
        return this.toolsRepository.getFootTrafficDetail(args);
      case 'get_competition_analysis':
        return this.toolsRepository.getCompetitionAnalysis(args);
      case 'get_commercial_risk':
        return this.toolsRepository.getCommercialRisk(args);
      case 'estimate_revenue_and_cost':
        return this.toolsRepository.estimateRevenueAndCost(args);
      default:
        return undefined;
    }
  }

  private parseArgs(argsJson: string): QueryParams {
    try {
      const parsed = JSON.parse(argsJson) as QueryParams;

      return parsed || {};
    } catch {
      return {} as QueryParams;
    }
  }
}
