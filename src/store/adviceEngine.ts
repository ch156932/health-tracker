import type { User, FoodEntry, ExerciseEntry, BodyMetric } from '../types';

export type AdviceLevel = 'danger' | 'warning' | 'success' | 'tip';

export interface Advice {
  id: string;
  level: AdviceLevel;
  category: string;
  icon: string;
  title: string;
  detail: string;
  action: string;
}

export interface HealthScore {
  total: number;           // 0-100
  weight: number;
  diet: number;
  exercise: number;
  sleep: number;
  body: number;
}

interface AnalysisInput {
  user: User;
  metrics: BodyMetric[];       // sorted by date asc
  foodEntries: FoodEntry[];
  exerciseEntries: ExerciseEntry[];
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function trend(arr: number[]): number {
  // 线性回归斜率（正=上升，负=下降）
  if (arr.length < 2) return 0;
  const n = arr.length;
  const sumX = (n * (n - 1)) / 2;
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
  const sumY = arr.reduce((s, v) => s + v, 0);
  const sumXY = arr.reduce((s, v, i) => s + i * v, 0);
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

export function generateAdvice(input: AnalysisInput): { advices: Advice[]; score: HealthScore } {
  const { user, metrics, foodEntries, exerciseEntries } = input;
  const advices: Advice[] = [];

  const d7ago = new Date(); d7ago.setDate(d7ago.getDate() - 7);
  const d30ago = new Date(); d30ago.setDate(d30ago.getDate() - 30);
  const d7str = d7ago.toISOString().split('T')[0];
  const d30str = d30ago.toISOString().split('T')[0];

  const recent7 = metrics.filter(m => m.date >= d7str);
  const recent30 = metrics.filter(m => m.date >= d30str);
  const latest = metrics[metrics.length - 1];

  const food7 = foodEntries.filter(e => e.date >= d7str);
  const exercise7 = exerciseEntries.filter(e => e.date >= d7str);

  // ===== 分项得分（0-20 each） =====
  let weightScore = 10;
  let dietScore = 10;
  let exerciseScore = 10;
  let sleepScore = 10;
  let bodyScore = 10;

  // ─────────────────────────────────────────
  // 1. 体重分析
  // ─────────────────────────────────────────
  if (latest?.weight) {
    const gap = latest.weight - user.targetWeight;
    const weights7 = recent7.filter(m => m.weight).map(m => m.weight!);
    const weights30 = recent30.filter(m => m.weight).map(m => m.weight!);
    const weekTrend = trend(weights7);   // kg/day
    const monthTrend = trend(weights30);

    if (gap > 0.5) {
      if (weekTrend > 0.05) {
        // 体重在上升
        advices.push({
          id: 'weight-rising',
          level: 'warning',
          category: '体重',
          icon: '⚖️',
          title: '近期体重持续上涨',
          detail: `近7天体重呈上升趋势（约 +${(weekTrend * 7).toFixed(1)} kg/周），距目标还差 ${gap.toFixed(1)} kg。`,
          action: '建议检查近期饮食热量是否超标，适当增加有氧运动频率。',
        });
        weightScore = 4;
      } else if (weekTrend < -0.1) {
        // 减重过快
        advices.push({
          id: 'weight-fast',
          level: 'warning',
          category: '体重',
          icon: '⚖️',
          title: '减重速度偏快',
          detail: `近7天体重下降约 ${Math.abs(weekTrend * 7).toFixed(1)} kg，超过推荐速度（0.5kg/周）。减重过快可能导致肌肉流失。`,
          action: '建议放缓节奏，增加优质蛋白质摄入，配合力量训练保住肌肉量。',
        });
        weightScore = 12;
      } else if (monthTrend < -0.02) {
        // 正常缓慢减重
        advices.push({
          id: 'weight-good',
          level: 'success',
          category: '体重',
          icon: '⚖️',
          title: '体重稳步下降，保持良好！',
          detail: `近30天体重下降趋势健康（约 ${Math.abs(monthTrend * 30).toFixed(1)} kg/月），距目标还差 ${gap.toFixed(1)} kg。`,
          action: '继续保持当前饮食和运动计划，避免大幅波动。',
        });
        weightScore = 18;
      } else {
        // 停滞
        advices.push({
          id: 'weight-plateau',
          level: 'tip',
          category: '体重',
          icon: '⚖️',
          title: '体重进入平台期',
          detail: `近期体重变化不明显，距目标还差 ${gap.toFixed(1)} kg。平台期通常在坚持4-6周后自然突破。`,
          action: '可尝试调整运动强度、改变饮食结构（如周期性热量波动），打破平台期。',
        });
        weightScore = 13;
      }
    } else if (gap < -0.5) {
      advices.push({
        id: 'weight-below',
        level: 'warning',
        category: '体重',
        icon: '⚖️',
        title: '体重已低于目标',
        detail: `当前体重 ${latest.weight} kg，已低于目标体重 ${user.targetWeight} kg。`,
        action: '建议适当增加热量摄入，以增肌为主要目标，维持健康体重。',
      });
      weightScore = 14;
    } else {
      advices.push({
        id: 'weight-target',
        level: 'success',
        category: '体重',
        icon: '⚖️',
        title: '体重已达目标！',
        detail: `当前体重 ${latest.weight} kg，与目标相差不到 0.5 kg，非常理想。`,
        action: '进入维持期，保持热量均衡，增加力量训练提升体型。',
      });
      weightScore = 20;
    }
  } else {
    advices.push({
      id: 'weight-nodata',
      level: 'tip',
      category: '体重',
      icon: '⚖️',
      title: '尚无体重数据',
      detail: '建议每天同一时间（如早晨起床后）称重，持续记录有助于发现规律。',
      action: '前往「指标」页录入今日体重。',
    });
    weightScore = 5;
  }

  // ─────────────────────────────────────────
  // 2. 饮食分析
  // ─────────────────────────────────────────
  const daysWithFood = [...new Set(food7.map(e => e.date))].length;
  const avgDailyCalories = daysWithFood > 0
    ? food7.reduce((s, e) => s + e.calories, 0) / daysWithFood
    : 0;
  const avgProtein = daysWithFood > 0
    ? food7.reduce((s, e) => s + e.protein, 0) / daysWithFood
    : 0;
  const bmr = latest?.bmr ?? (user.gender === 'male'
    ? 88.36 + 13.4 * (latest?.weight ?? 70) + 4.8 * user.height - 5.7 * user.age
    : 447.6 + 9.2 * (latest?.weight ?? 55) + 3.1 * user.height - 4.3 * user.age);

  if (daysWithFood === 0) {
    advices.push({
      id: 'diet-nodata',
      level: 'tip',
      category: '饮食',
      icon: '🍽️',
      title: '近7天无饮食记录',
      detail: '坚持记录饮食是控制热量的最有效方法，研究表明记录饮食的人减重效果提升40%。',
      action: '前往「饮食」页开始记录，每餐只需30秒。',
    });
    dietScore = 5;
  } else {
    // 热量分析
    if (avgDailyCalories > 0 && avgDailyCalories < bmr * 0.75) {
      advices.push({
        id: 'diet-low-cal',
        level: 'danger',
        category: '饮食',
        icon: '🍽️',
        title: '热量摄入严重不足',
        detail: `近7天日均摄入 ${Math.round(avgDailyCalories)} kcal，低于您基础代谢率（${Math.round(bmr)} kcal）的75%，长期如此会损伤代谢和免疫。`,
        action: '立即增加热量摄入至不低于基础代谢率，建议咨询营养师制定合理方案。',
      });
      dietScore = 3;
    } else if (avgDailyCalories > user.dailyCalorieGoal * 1.25) {
      advices.push({
        id: 'diet-high-cal',
        level: 'warning',
        category: '饮食',
        icon: '🍽️',
        title: '热量摄入持续超标',
        detail: `近7天日均摄入 ${Math.round(avgDailyCalories)} kcal，超出每日目标（${user.dailyCalorieGoal} kcal）约 ${Math.round(avgDailyCalories - user.dailyCalorieGoal)} kcal。`,
        action: '建议减少精加工食品和高热量零食，每餐先吃蔬菜和蛋白质，再吃主食。',
      });
      dietScore = 6;
    } else if (avgDailyCalories >= bmr * 0.75 && avgDailyCalories <= user.dailyCalorieGoal * 1.1) {
      advices.push({
        id: 'diet-good-cal',
        level: 'success',
        category: '饮食',
        icon: '🍽️',
        title: '热量控制良好',
        detail: `近7天日均摄入 ${Math.round(avgDailyCalories)} kcal，在目标范围内，热量管理优秀！`,
        action: '继续保持，注意营养均衡，适当增加膳食纤维摄入。',
      });
      dietScore = 18;
    }

    // 蛋白质分析
    const targetProtein = (latest?.weight ?? 70) * 1.4; // 1.4g/kg
    if (avgProtein < targetProtein * 0.7) {
      advices.push({
        id: 'diet-protein',
        level: 'warning',
        category: '饮食',
        icon: '🥩',
        title: '蛋白质摄入偏少',
        detail: `近7天日均蛋白质摄入约 ${Math.round(avgProtein)} g，建议摄入 ${Math.round(targetProtein)} g（体重×1.4g）。蛋白质不足会导致肌肉流失。`,
        action: '每餐增加鸡胸肉、鱼、蛋、豆腐等高蛋白食物，也可考虑蛋白粉补充。',
      });
      dietScore = Math.max(dietScore - 4, 0);
    } else if (avgProtein >= targetProtein) {
      advices.push({
        id: 'diet-protein-good',
        level: 'success',
        category: '饮食',
        icon: '🥩',
        title: '蛋白质摄入充足',
        detail: `日均蛋白质摄入 ${Math.round(avgProtein)} g，达到推荐量，有助于维持肌肉和提高饱腹感。`,
        action: '保持优质蛋白质来源多样化，搭配适量碳水有助于蛋白质吸收。',
      });
    }

    // 营养素比例分析
    const totalMacro = food7.reduce((s, e) => s + e.protein + e.carbs + e.fat, 0);
    if (totalMacro > 0) {
      const carbRatio = food7.reduce((s, e) => s + e.carbs, 0) / totalMacro;
      const fatRatio = food7.reduce((s, e) => s + e.fat, 0) / totalMacro;
      if (fatRatio > 0.45) {
        advices.push({
          id: 'diet-fat',
          level: 'warning',
          category: '饮食',
          icon: '🧈',
          title: '脂肪摄入比例偏高',
          detail: `近7天脂肪占总营养素约 ${Math.round(fatRatio * 100)}%，建议控制在 30% 以内。`,
          action: '减少煎炸食物、肥肉、奶油类食品，选择橄榄油、坚果等优质脂肪来源。',
        });
        dietScore = Math.max(dietScore - 3, 0);
      }
      if (carbRatio < 0.3) {
        advices.push({
          id: 'diet-carb',
          level: 'tip',
          category: '饮食',
          icon: '🍚',
          title: '碳水摄入较低',
          detail: `近7天碳水化合物占比约 ${Math.round(carbRatio * 100)}%，长期低碳可能影响运动表现和精力。`,
          action: '可在运动前后适当补充优质碳水，如燕麦、红薯、糙米。',
        });
      }
    }
  }

  // ─────────────────────────────────────────
  // 3. 运动分析
  // ─────────────────────────────────────────
  const exerciseDays = [...new Set(exercise7.map(e => e.date))].length;
  const totalExerciseMins = exercise7.reduce((s, e) => s + e.duration, 0);
  const hasStrength = exercise7.some(e => e.type === '力量');
  const hasCardio = exercise7.some(e => e.type === '有氧');
  const avgSteps = latest?.steps
    ? avg(recent7.filter(m => m.steps).map(m => m.steps!))
    : 0;

  if (exerciseDays === 0) {
    advices.push({
      id: 'exercise-none',
      level: 'danger',
      category: '运动',
      icon: '🏃',
      title: '近7天没有运动记录',
      detail: '长期缺乏运动是代谢综合征的重要风险因素。每周150分钟中等强度运动是健康最低标准。',
      action: '从今天起，哪怕只是30分钟快走，也请记录下来。培养运动习惯是最重要的第一步。',
    });
    exerciseScore = 2;
  } else if (exerciseDays < 3) {
    advices.push({
      id: 'exercise-less',
      level: 'warning',
      category: '运动',
      icon: '🏃',
      title: '运动频率偏低',
      detail: `近7天仅运动 ${exerciseDays} 天（共 ${totalExerciseMins} 分钟），建议每周至少运动 4-5 天。`,
      action: '尝试把运动融入日常，如骑车上班、午休快走、睡前拉伸，降低执行门槛。',
    });
    exerciseScore = 8;
  } else if (exerciseDays >= 5 && totalExerciseMins >= 150) {
    advices.push({
      id: 'exercise-great',
      level: 'success',
      category: '运动',
      icon: '🏃',
      title: '运动习惯优秀！',
      detail: `近7天运动 ${exerciseDays} 天，累计 ${totalExerciseMins} 分钟，达到并超过WHO推荐标准。`,
      action: '继续保持！注意运动后充分拉伸和休息恢复，防止过度训练。',
    });
    exerciseScore = 20;
  } else {
    advices.push({
      id: 'exercise-ok',
      level: 'tip',
      category: '运动',
      icon: '🏃',
      title: '运动频率良好，可再提升',
      detail: `近7天运动 ${exerciseDays} 天，累计 ${totalExerciseMins} 分钟。`,
      action: '再增加1-2次运动即可达到最优健康效果。',
    });
    exerciseScore = 15;
  }

  if (exerciseDays > 0 && !hasStrength) {
    advices.push({
      id: 'exercise-strength',
      level: 'tip',
      category: '运动',
      icon: '💪',
      title: '缺少力量训练',
      detail: '近7天运动记录中没有力量训练。力量训练能有效提高基础代谢，预防减重期间的肌肉流失。',
      action: '每周安排2次力量训练（深蹲、俯卧撑、哑铃等），每次30-45分钟。',
    });
    exerciseScore = Math.max(exerciseScore - 3, 0);
  }

  if (exerciseDays > 0 && !hasCardio) {
    advices.push({
      id: 'exercise-cardio',
      level: 'tip',
      category: '运动',
      icon: '🫀',
      title: '建议增加有氧运动',
      detail: '有氧运动对心肺健康、脂肪燃烧和情绪调节有显著效果。',
      action: '每周安排2-3次有氧运动（跑步、骑车、游泳），每次20-40分钟，心率控制在最大心率的60-80%。',
    });
  }

  if (avgSteps > 0 && avgSteps < 5000) {
    advices.push({
      id: 'steps-low',
      level: 'warning',
      category: '运动',
      icon: '🚶',
      title: '日均步数偏低',
      detail: `近期日均步数约 ${Math.round(avgSteps)} 步，低于推荐的8000步/天。久坐是代谢下降的主因。`,
      action: '设置每小时起身活动提醒，通勤时提前一站下车步行，午休时多走走。',
    });
    exerciseScore = Math.max(exerciseScore - 2, 0);
  } else if (avgSteps >= 10000) {
    advices.push({
      id: 'steps-great',
      level: 'success',
      category: '运动',
      icon: '🚶',
      title: '步数达标，活动量充足',
      detail: `日均步数 ${Math.round(avgSteps)} 步，超过推荐标准，活动量很好！`,
      action: '保持活跃的生活方式，这对心血管健康有长期积极影响。',
    });
  }

  // ─────────────────────────────────────────
  // 4. 睡眠分析
  // ─────────────────────────────────────────
  const sleepValues = recent7.filter(m => m.sleepHours).map(m => m.sleepHours!);
  const avgSleep = avg(sleepValues);
  const sleepQualityValues = recent7.filter(m => m.sleepQuality).map(m => m.sleepQuality!);
  const avgSleepQuality = avg(sleepQualityValues);

  if (sleepValues.length === 0) {
    advices.push({
      id: 'sleep-nodata',
      level: 'tip',
      category: '睡眠',
      icon: '😴',
      title: '尚无睡眠数据',
      detail: '睡眠质量直接影响体重管理、荷尔蒙分泌和肌肉恢复，建议持续记录。',
      action: '每天在「指标」页记录睡眠时长，或通过华为/OPPO健康导入数据。',
    });
    sleepScore = 8;
  } else if (avgSleep < 6) {
    advices.push({
      id: 'sleep-poor',
      level: 'danger',
      category: '睡眠',
      icon: '😴',
      title: '睡眠严重不足',
      detail: `近7天平均睡眠仅 ${avgSleep.toFixed(1)} 小时，远低于成人推荐的7-9小时。睡眠不足会导致饥饿素升高，增加暴饮暴食风险30%+。`,
      action: '调整作息时间，保证22:00-23:00前入睡。睡前1小时避免手机蓝光，可尝试正念冥想助眠。',
    });
    sleepScore = 3;
  } else if (avgSleep < 7) {
    advices.push({
      id: 'sleep-less',
      level: 'warning',
      category: '睡眠',
      icon: '😴',
      title: '睡眠时间略显不足',
      detail: `近7天平均睡眠 ${avgSleep.toFixed(1)} 小时，略低于推荐的7-9小时。`,
      action: '尽量将睡眠时间延长至7小时以上，固定起床时间有助于调节生物钟。',
    });
    sleepScore = 12;
  } else if (avgSleep >= 7 && avgSleep <= 9) {
    advices.push({
      id: 'sleep-good',
      level: 'success',
      category: '睡眠',
      icon: '😴',
      title: '睡眠时间充足',
      detail: `近7天平均睡眠 ${avgSleep.toFixed(1)} 小时，处于推荐范围，睡眠管理优秀！`,
      action: `${avgSleepQuality < 3 ? '睡眠质量有待提升，建议睡前避免剧烈运动和咖啡因摄入。' : '继续保持良好的作息习惯。'}`,
    });
    sleepScore = avgSleepQuality >= 3 ? 20 : 16;
  } else {
    advices.push({
      id: 'sleep-too-much',
      level: 'tip',
      category: '睡眠',
      icon: '😴',
      title: '睡眠时间偏长',
      detail: `近7天平均睡眠 ${avgSleep.toFixed(1)} 小时，超过9小时可能与慢性疲劳或情绪问题有关。`,
      action: '若长期嗜睡，建议排查是否存在睡眠呼吸暂停或情绪问题，必要时就医。',
    });
    sleepScore = 14;
  }

  // ─────────────────────────────────────────
  // 5. 体成分分析
  // ─────────────────────────────────────────
  const muscleMassValues30 = recent30.filter(m => m.muscleMass).map(m => m.muscleMass!);
  const bodyWaterValues = recent7.filter(m => m.bodyWater).map(m => m.bodyWater!);

  // 体脂
  const latestBodyFat = latest?.bodyFat;
  const maleHighFat = 25, femaleHighFat = 32;
  const highFatThreshold = user.gender === 'male' ? maleHighFat : femaleHighFat;
  if (latestBodyFat) {
    if (latestBodyFat > highFatThreshold) {
      advices.push({
        id: 'body-fat-high',
        level: 'warning',
        category: '体成分',
        icon: '🔥',
        title: '体脂率偏高',
        detail: `当前体脂率 ${latestBodyFat}%，超过健康上限（${user.gender === 'male' ? '男性25%' : '女性32%'}）。高体脂增加代谢疾病风险。`,
        action: '通过热量赤字饮食（每日缺口300-500kcal）结合有氧运动降低体脂，同时用力量训练保住肌肉。',
      });
      bodyScore = Math.max(bodyScore - 4, 0);
    } else if (latestBodyFat < (user.gender === 'male' ? 10 : 17)) {
      advices.push({
        id: 'body-fat-low',
        level: 'warning',
        category: '体成分',
        icon: '🔥',
        title: '体脂率偏低',
        detail: `当前体脂率 ${latestBodyFat}%，低于健康下限。过低体脂可能影响激素水平和免疫功能。`,
        action: '适当增加健康脂肪摄入（坚果、牛油果、深海鱼），减少过度有氧训练。',
      });
      bodyScore = Math.max(bodyScore - 3, 0);
    } else {
      bodyScore += 3;
    }
  }

  // 肌肉量趋势
  if (muscleMassValues30.length >= 5) {
    const muscleTrend = trend(muscleMassValues30);
    if (muscleTrend < -0.02) {
      advices.push({
        id: 'body-muscle-loss',
        level: 'warning',
        category: '体成分',
        icon: '💪',
        title: '肌肉量持续下降',
        detail: `近30天肌肉量下降约 ${Math.abs(muscleTrend * 30).toFixed(1)} kg。减脂期间肌肉流失是常见问题，需要主动干预。`,
        action: '增加蛋白质摄入（1.6~2g/kg体重），每周2-3次抗阻训练，避免过大热量缺口。',
      });
      bodyScore = Math.max(bodyScore - 4, 0);
    } else if (muscleTrend > 0.01) {
      advices.push({
        id: 'body-muscle-gain',
        level: 'success',
        category: '体成分',
        icon: '💪',
        title: '肌肉量稳步增加',
        detail: `近30天肌肉量增加约 ${(muscleTrend * 30).toFixed(1)} kg，体成分在向好的方向改变。`,
        action: '继续保持力量训练和充足蛋白质摄入，确保睡眠质量支持肌肉恢复。',
      });
      bodyScore = Math.min(bodyScore + 3, 20);
    }
  }

  // 水分率
  if (bodyWaterValues.length > 0) {
    const latestWater = bodyWaterValues[bodyWaterValues.length - 1];
    const lowWater = user.gender === 'male' ? 55 : 50;
    if (latestWater < lowWater) {
      advices.push({
        id: 'body-water-low',
        level: 'warning',
        category: '体成分',
        icon: '💧',
        title: '身体水分率偏低',
        detail: `当前水分率 ${latestWater}%，低于健康参考值（${user.gender === 'male' ? '男性55%' : '女性50%'}以上），可能处于轻度脱水。`,
        action: '每天饮水量保证体重×30ml（如70kg → 2100ml），运动时额外补充，避免以口渴为补水信号。',
      });
      bodyScore = Math.max(bodyScore - 2, 0);
    }
  }

  // ─────────────────────────────────────────
  // 综合健康评分（0-100）
  // ─────────────────────────────────────────
  const total = Math.min(100, Math.max(0,
    weightScore + dietScore + exerciseScore + sleepScore + bodyScore
  ));

  // 按优先级排序：danger → warning → tip → success
  const levelOrder = { danger: 0, warning: 1, tip: 2, success: 3 };
  advices.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  return {
    advices,
    score: {
      total,
      weight: weightScore * 5,
      diet: dietScore * 5,
      exercise: exerciseScore * 5,
      sleep: sleepScore * 5,
      body: bodyScore * 5,
    },
  };
}
