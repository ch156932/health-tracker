import type { User, FoodEntry, ExerciseEntry, BodyMetric } from '../types';

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function rand(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

export function generateSampleData() {
  const users: User[] = [
    {
      id: 'user1',
      name: '张三',
      avatar: '👨',
      gender: 'male',
      age: 28,
      height: 175,
      targetWeight: 70,
      dailyCalorieGoal: 2000,
    },
    {
      id: 'user2',
      name: '李梅',
      avatar: '👩',
      gender: 'female',
      age: 25,
      height: 163,
      targetWeight: 52,
      dailyCalorieGoal: 1600,
    },
  ];

  const foodEntries: FoodEntry[] = [];
  const exerciseEntries: ExerciseEntry[] = [];
  const bodyMetrics: BodyMetric[] = [];

  const userBaseWeights: Record<string, number> = { user1: 78, user2: 58 };

  for (const user of users) {
    const baseWeight = userBaseWeights[user.id];
    for (let day = 30; day >= 0; day--) {
      const date = dateStr(day);

      // 体重每天缓慢减少（含随机波动）
      const weight = parseFloat((baseWeight - (30 - day) * 0.08 + rand(-0.3, 0.3)).toFixed(1));
      const bmi = parseFloat((weight / ((user.height / 100) ** 2)).toFixed(1));
      // 体成分随体重变化
      const bodyFatPct = user.gender === 'male' ? rand(18, 24) : rand(24, 30);
      const fatMass = parseFloat((weight * bodyFatPct / 100).toFixed(1));
      const leanMass = parseFloat((weight - fatMass).toFixed(1));
      const muscleMass = parseFloat((leanMass * 0.85).toFixed(1));
      const skeletalMuscleMass = parseFloat((leanMass * 0.45).toFixed(1));
      const boneMass = parseFloat((weight * (user.gender === 'male' ? rand(0.030, 0.036) : rand(0.026, 0.032))).toFixed(2));
      const bodyWater = parseFloat((user.gender === 'male' ? rand(55, 65) : rand(50, 60)).toFixed(1));
      const proteinPercentage = parseFloat(rand(16, 20).toFixed(1));
      const bmr = Math.round(user.gender === 'male'
        ? 88.36 + 13.4 * weight + 4.8 * user.height - 5.7 * user.age
        : 447.6 + 9.2 * weight + 3.1 * user.height - 4.3 * user.age);

      bodyMetrics.push({
        id: `metric_${user.id}_${date}`,
        userId: user.id,
        date,
        weight,
        bmi,
        bodyFat: bodyFatPct,
        steps: Math.round(rand(4000, 12000)),
        heartRate: Math.round(rand(62, 82)),
        sleepHours: rand(5.5, 8.5),
        sleepQuality: Math.round(rand(2, 5)),
        systolic: Math.round(rand(110, 130)),
        diastolic: Math.round(rand(70, 85)),
        bloodOxygen: Math.round(rand(96, 99)),
        proteinPercentage,
        bmr,
        bodyWater,
        boneMass,
        muscleMass,
        skeletalMuscleMass,
      });

      // 每天3餐饮食
      const meals = [
        { mealType: 'breakfast' as const, entries: [
          { name: '燕麦粥', calories: 204, protein: 7.2, carbs: 36, fat: 4.2 },
          { name: '鸡蛋', calories: 86, protein: 8, carbs: 0.6, fat: 5.7 },
        ]},
        { mealType: 'lunch' as const, entries: [
          { name: '白米饭', calories: 232, protein: 5.2, carbs: 51.2, fat: 0.6 },
          { name: '鸡胸肉', calories: 200, protein: 40, carbs: 0, fat: 4.8 },
          { name: '清炒蔬菜', calories: 90, protein: 3.6, carbs: 10, fat: 5 },
        ]},
        { mealType: 'dinner' as const, entries: [
          { name: '面条(煮熟)', calories: 218, protein: 7.2, carbs: 44.6, fat: 1 },
          { name: '西红柿', calories: 30, protein: 1.8, carbs: 6.4, fat: 0.4 },
          { name: '豆腐(北)', calories: 87, protein: 11.1, carbs: 3, fat: 4.1 },
        ]},
      ];

      for (const meal of meals) {
        for (const item of meal.entries) {
          foodEntries.push({
            id: `food_${user.id}_${date}_${meal.mealType}_${item.name}`,
            userId: user.id,
            date,
            mealType: meal.mealType,
            ...item,
          });
        }
      }

      // 每隔1-2天运动一次
      if (day % 2 === 0) {
        const exercises = [
          { type: '有氧', name: '跑步(中速)', duration: 30, caloriesBurned: 294, intensity: 'medium' as const },
          { type: '有氧', name: '快走', duration: 45, caloriesBurned: 193, intensity: 'low' as const },
          { type: '力量', name: '健身房力量训练', duration: 45, caloriesBurned: 270, intensity: 'medium' as const },
        ];
        const ex = exercises[day % exercises.length];
        exerciseEntries.push({
          id: `exercise_${user.id}_${date}`,
          userId: user.id,
          date,
          ...ex,
        });
      }
    }
  }

  return {
    users,
    currentUserId: 'user1',
    foodEntries,
    exerciseEntries,
    bodyMetrics,
  };
}
