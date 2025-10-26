// TFJS may not be available in all environments. Lazily load it when needed.
let tf: any = null;
import { logger } from '../utils/logger';

export interface PlayerBehaviorData {
  cultivationStage: number;
  combatWins: number;
  combatLosses: number;
  questsCompleted: number;
  timeSpent: number; // in minutes
  averageSessionLength: number;
  breakthroughAttempts: number;
  successfulBreakthroughs: number;
}

export interface AnalyticsPrediction {
  predictedSuccessRate: number;
  recommendedActions: string[];
  riskAssessment: 'low' | 'medium' | 'high';
}

export class AIAnalyticsSystem {
  private model: any = null;
  private trainingData: PlayerBehaviorData[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Lazy-load TFJS when first initializing the model
    if (!tf) {
      try {
        // TFJS is an optional runtime dependency that may not be installed in all environments.
        // Narrowly disable type checking for this import so compilation doesn't fail when TFJS
        // isn't present. We prefer ambient declarations, but keep this inline suppression to
        // avoid mass config changes across the repo.
  // Allow @ts-ignore here because TFJS is an optional runtime-only dependency and
  // we prefer to keep this import tolerant across environments. This is narrowly
  // scoped to the dynamic import and documented.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore -- optional runtime-only dependency
  const mod = await import('@tensorflow/tfjs');
        tf = (mod as any).default || mod;
      } catch (err) {
        logger.warn('AIAnalyticsSystem: @tensorflow/tfjs failed to load', err);
        throw err;
      }
    }

    // Create a simple neural network for predicting success rates
    this.model = tf.sequential();
    this.model.add(tf.layers.dense({ inputShape: [8], units: 16, activation: 'relu' }));
    this.model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    this.model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    this.isInitialized = true;
  }

  addTrainingData(data: PlayerBehaviorData, _success: boolean): void {
    this.trainingData.push(data);
    // In a real implementation, you'd periodically retrain the model
  }

  async predictSuccess(data: PlayerBehaviorData): Promise<AnalyticsPrediction> {
    if (!this.isInitialized || !this.model) {
      await this.initialize();
    }

    const input = tf.tensor2d([[
      data.cultivationStage,
      data.combatWins,
      data.combatLosses,
      data.questsCompleted,
      data.timeSpent,
      data.averageSessionLength,
      data.breakthroughAttempts,
      data.successfulBreakthroughs
    ]]);

  const model = this.model;
  if (!model) throw new Error('AIAnalyticsSystem: model missing after initialize');
  const prediction: any = model.predict(input);
  const successRate = (await prediction.data())[0];

    input.dispose();
    prediction.dispose();

    const recommendedActions = this.generateRecommendations(data, successRate);
    const riskAssessment = this.assessRisk(successRate);

    return {
      predictedSuccessRate: successRate,
      recommendedActions,
      riskAssessment
    };
  }

  private generateRecommendations(data: PlayerBehaviorData, successRate: number): string[] {
    const recommendations: string[] = [];

    if (data.combatWins / (data.combatWins + data.combatLosses) < 0.5) {
      recommendations.push('Focus on improving combat skills through training');
    }

    if (data.successfulBreakthroughs / data.breakthroughAttempts < 0.3) {
      recommendations.push('Consider seeking mentorship for cultivation guidance');
    }

    if (data.questsCompleted < data.cultivationStage * 5) {
      recommendations.push('Complete more quests to gain experience and resources');
    }

    if (successRate < 0.4) {
      recommendations.push('Take a break and review your cultivation strategy');
    }

    return recommendations;
  }

  private assessRisk(successRate: number): 'low' | 'medium' | 'high' {
    if (successRate > 0.7) return 'low';
    if (successRate > 0.4) return 'medium';
    return 'high';
  }

  calculateEngagementMetrics(data: PlayerBehaviorData): {
    engagementScore: number;
    consistencyScore: number;
    progressEfficiency: number;
  } {
    const engagementScore = Math.min(100,
      (data.timeSpent / 100) * 20 +
      (data.questsCompleted / 10) * 30 +
      ((data.combatWins + data.combatLosses) / 20) * 25 +
      (data.successfulBreakthroughs / 5) * 25
    );

    const consistencyScore = Math.min(100,
      (data.averageSessionLength / 30) * 50 +
      (data.breakthroughAttempts > 0 ? data.successfulBreakthroughs / data.breakthroughAttempts * 50 : 0)
    );

    const progressEfficiency = data.cultivationStage > 0 ?
      (data.successfulBreakthroughs / data.cultivationStage) * 100 : 0;

    return { engagementScore, consistencyScore, progressEfficiency };
  }

  async trainModel(): Promise<void> {
    if (this.trainingData.length < 10) return; // Need minimum data

    const inputs: number[][] = [];
    const outputs: number[] = [];

    // For demo, assume success if engagement score > 50
    this.trainingData.forEach(data => {
      inputs.push([
        data.cultivationStage,
        data.combatWins,
        data.combatLosses,
        data.questsCompleted,
        data.timeSpent,
        data.averageSessionLength,
        data.breakthroughAttempts,
        data.successfulBreakthroughs
      ]);

      const engagement = this.calculateEngagementMetrics(data).engagementScore;
      outputs.push(engagement > 50 ? 1 : 0);
    });

    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs, [outputs.length, 1]);

    const model = this.model;
    if (!model) {
      // Attempt to initialize if model is missing
      await this.initialize();
    }
    const model2 = this.model;
    if (!model2) throw new Error('AIAnalyticsSystem: model not available for training');
    await model2.fit(inputTensor, outputTensor, {
      epochs: 50,
      batchSize: 4,
      callbacks: {
        onEpochEnd: (epoch: number, logs?: { loss?: number } | null) => {
          if (epoch % 10 === 0) {
            logger.info && typeof logger.info === 'function' ? logger.info(`Epoch ${epoch}: loss = ${logs?.loss}`) : void 0;
          }
        }
      }
    });

    inputTensor.dispose();
    outputTensor.dispose();
  }
}
