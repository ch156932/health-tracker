// ===== 数据类型定义 =====

export type Gender = 'male' | 'female' | 'other';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Intensity = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  avatar: string; // emoji
  gender: Gender;
  age: number;
  height: number; // cm
  targetWeight: number; // kg
  dailyCalorieGoal: number;
}

export interface FoodEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  name: string;
  calories: number;
  protein: number; // g
  carbs: number;   // g
  fat: number;     // g
}

export interface ExerciseEntry {
  id: string;
  userId: string;
  date: string;
  type: string;
  name: string;
  duration: number;      // minutes
  caloriesBurned: number;
  intensity: Intensity;
}

export interface BodyMetric {
  id: string;
  userId: string;
  date: string;
  weight?: number;      // kg
  bmi?: number;
  bodyFat?: number;     // %
  steps?: number;
  heartRate?: number;   // bpm
  sleepHours?: number;
  sleepQuality?: number; // 1-5
  systolic?: number;           // 收缩压 mmHg
  diastolic?: number;          // 舒张压 mmHg
  bloodOxygen?: number;        // % SpO2
  proteinPercentage?: number;  // 蛋白质含量 %
  bmr?: number;                // 基础代谢率 kcal/day
  bodyWater?: number;          // 水分率 %
  boneMass?: number;           // 骨盐量 kg
  muscleMass?: number;         // 肌肉量 kg
  skeletalMuscleMass?: number; // 骨骼肌量 kg
}

// ===== 内置食物数据库 =====
export interface FoodItem {
  name: string;
  calories: number; // per 100g
  protein: number;
  carbs: number;
  fat: number;
  portion: number; // 常用份量(g)
}

export const FOOD_DATABASE: FoodItem[] = [
  { name: '白米饭', calories: 116, protein: 2.6, carbs: 25.6, fat: 0.3, portion: 200 },
  { name: '馒头', calories: 223, protein: 7.0, carbs: 47.0, fat: 1.1, portion: 100 },
  { name: '面条(煮熟)', calories: 109, protein: 3.6, carbs: 22.3, fat: 0.5, portion: 200 },
  { name: '全麦面包', calories: 247, protein: 9.0, carbs: 43.0, fat: 3.0, portion: 60 },
  { name: '鸡胸肉', calories: 133, protein: 26.7, carbs: 0, fat: 3.2, portion: 150 },
  { name: '猪里脊', calories: 143, protein: 20.7, carbs: 0, fat: 6.2, portion: 100 },
  { name: '牛腱子', calories: 187, protein: 22.7, carbs: 0, fat: 10.0, portion: 100 },
  { name: '三文鱼', calories: 139, protein: 19.8, carbs: 0, fat: 6.5, portion: 150 },
  { name: '鸡蛋', calories: 144, protein: 13.3, carbs: 1.0, fat: 9.5, portion: 60 },
  { name: '牛奶(全脂)', calories: 66, protein: 3.0, carbs: 4.8, fat: 3.6, portion: 250 },
  { name: '豆腐(北)', calories: 58, protein: 7.4, carbs: 2.0, fat: 2.7, portion: 150 },
  { name: '花椰菜', calories: 26, protein: 2.5, carbs: 3.7, fat: 0.3, portion: 200 },
  { name: '西红柿', calories: 15, protein: 0.9, carbs: 3.2, fat: 0.2, portion: 200 },
  { name: '黄瓜', calories: 16, protein: 0.8, carbs: 3.0, fat: 0.1, portion: 200 },
  { name: '菠菜', calories: 28, protein: 2.6, carbs: 3.6, fat: 0.3, portion: 100 },
  { name: '苹果', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, portion: 200 },
  { name: '香蕉', calories: 91, protein: 1.1, carbs: 20.9, fat: 0.3, portion: 120 },
  { name: '橙子', calories: 47, protein: 0.9, carbs: 11.1, fat: 0.1, portion: 200 },
  { name: '葡萄', calories: 67, protein: 0.6, carbs: 16.1, fat: 0.4, portion: 150 },
  { name: '坚果(混合)', calories: 607, protein: 18.0, carbs: 21.0, fat: 52.0, portion: 30 },
  { name: '花生', calories: 589, protein: 25.8, carbs: 16.1, fat: 48.0, portion: 30 },
  { name: '酸奶(原味)', calories: 61, protein: 3.5, carbs: 7.0, fat: 1.5, portion: 200 },
  { name: '奶酪', calories: 403, protein: 25.0, carbs: 1.3, fat: 33.0, portion: 30 },
  { name: '可乐(330ml)', calories: 139, protein: 0, carbs: 36.0, fat: 0, portion: 330 },
  { name: '橙汁(250ml)', calories: 113, protein: 1.8, carbs: 26.4, fat: 0.5, portion: 250 },
  { name: '绿茶(无糖)', calories: 0, protein: 0, carbs: 0, fat: 0, portion: 300 },
  { name: '炸鸡(1块)', calories: 226, protein: 19.0, carbs: 10.0, fat: 12.0, portion: 100 },
  { name: '汉堡', calories: 295, protein: 17.0, carbs: 24.0, fat: 14.0, portion: 150 },
  { name: '披萨(1片)', calories: 285, protein: 12.0, carbs: 36.0, fat: 10.0, portion: 120 },
  { name: '薯条', calories: 312, protein: 3.4, carbs: 41.0, fat: 15.0, portion: 100 },
  { name: '炒鸡蛋', calories: 162, protein: 11.0, carbs: 1.2, fat: 12.0, portion: 100 },
  { name: '清炒蔬菜', calories: 45, protein: 1.8, carbs: 5.0, fat: 2.5, portion: 200 },
  { name: '红烧肉', calories: 472, protein: 15.0, carbs: 6.0, fat: 43.0, portion: 100 },
  { name: '蛋炒饭', calories: 170, protein: 5.5, carbs: 28.0, fat: 4.8, portion: 300 },
  { name: '水饺(20个)', calories: 280, protein: 14.0, carbs: 35.0, fat: 8.0, portion: 200 },
  { name: '麻辣烫', calories: 340, protein: 18.0, carbs: 38.0, fat: 12.0, portion: 400 },
  { name: '沙拉(蔬菜)', calories: 25, protein: 1.5, carbs: 4.5, fat: 0.5, portion: 300 },
  { name: '燕麦粥', calories: 68, protein: 2.4, carbs: 12.0, fat: 1.4, portion: 300 },
  { name: '鸡蛋羹', calories: 66, protein: 6.4, carbs: 2.0, fat: 3.5, portion: 200 },
  { name: '虾仁', calories: 99, protein: 20.3, carbs: 1.3, fat: 1.7, portion: 100 },
  { name: '西兰花', calories: 33, protein: 2.8, carbs: 6.4, fat: 0.4, portion: 200 },
  { name: '胡萝卜', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, portion: 100 },
  { name: '土豆', calories: 77, protein: 2.0, carbs: 17.0, fat: 0.1, portion: 200 },
  { name: '玉米', calories: 86, protein: 3.2, carbs: 19.0, fat: 1.2, portion: 200 },
  { name: '豆浆(无糖)', calories: 31, protein: 3.0, carbs: 1.8, fat: 1.6, portion: 300 },
  { name: '冰淇淋', calories: 207, protein: 3.5, carbs: 23.0, fat: 11.0, portion: 100 },
  { name: '巧克力', calories: 546, protein: 5.0, carbs: 60.0, fat: 31.0, portion: 40 },
  { name: '饼干(奥利奥)', calories: 473, protein: 5.0, carbs: 67.0, fat: 21.0, portion: 50 },
  { name: '豆腐脑', calories: 35, protein: 3.5, carbs: 2.0, fat: 1.8, portion: 300 },
  { name: '卤蛋', calories: 158, protein: 13.0, carbs: 1.5, fat: 10.5, portion: 50 },
  // 汤类
  { name: '酸辣汤', calories: 55, protein: 3.5, carbs: 6.0, fat: 2.0, portion: 400 },
  { name: '番茄蛋花汤', calories: 35, protein: 2.5, carbs: 4.0, fat: 1.2, portion: 400 },
  { name: '紫菜蛋花汤', calories: 25, protein: 2.8, carbs: 2.0, fat: 0.8, portion: 400 },
  { name: '排骨汤', calories: 80, protein: 8.0, carbs: 0.5, fat: 5.0, portion: 400 },
  { name: '玉米排骨汤', calories: 90, protein: 7.0, carbs: 8.0, fat: 4.0, portion: 400 },
  { name: '冬瓜汤', calories: 18, protein: 1.0, carbs: 3.5, fat: 0.2, portion: 400 },
  // 家常菜
  { name: '番茄炒鸡蛋', calories: 120, protein: 7.0, carbs: 8.0, fat: 7.0, portion: 200 },
  { name: '青椒肉丝', calories: 145, protein: 12.0, carbs: 6.0, fat: 8.5, portion: 200 },
  { name: '宫保鸡丁', calories: 185, protein: 14.0, carbs: 8.0, fat: 11.0, portion: 200 },
  { name: '鱼香肉丝', calories: 165, protein: 11.0, carbs: 10.0, fat: 9.0, portion: 200 },
  { name: '回锅肉', calories: 320, protein: 14.0, carbs: 5.0, fat: 27.0, portion: 150 },
  { name: '麻婆豆腐', calories: 110, protein: 7.5, carbs: 5.0, fat: 7.0, portion: 200 },
  { name: '糖醋里脊', calories: 220, protein: 12.0, carbs: 22.0, fat: 9.0, portion: 150 },
  { name: '清蒸鱼', calories: 105, protein: 18.0, carbs: 1.0, fat: 3.5, portion: 200 },
  { name: '红烧鱼', calories: 140, protein: 17.0, carbs: 4.0, fat: 6.0, portion: 200 },
  { name: '白灼虾', calories: 95, protein: 19.0, carbs: 0.5, fat: 1.5, portion: 150 },
  { name: '蒜蓉西兰花', calories: 55, protein: 3.5, carbs: 6.0, fat: 2.5, portion: 200 },
  { name: '凉拌黄瓜', calories: 20, protein: 0.8, carbs: 3.5, fat: 0.5, portion: 200 },
  { name: '拍黄瓜', calories: 25, protein: 0.9, carbs: 4.0, fat: 0.8, portion: 200 },
  // 主食
  { name: '小米粥', calories: 46, protein: 1.4, carbs: 9.5, fat: 0.3, portion: 300 },
  { name: '八宝粥', calories: 72, protein: 2.0, carbs: 15.0, fat: 0.5, portion: 300 },
  { name: '包子(肉馅)', calories: 220, protein: 9.0, carbs: 30.0, fat: 7.0, portion: 120 },
  { name: '包子(菜馅)', calories: 160, protein: 5.0, carbs: 26.0, fat: 4.0, portion: 120 },
  { name: '花卷', calories: 210, protein: 6.0, carbs: 43.0, fat: 1.5, portion: 100 },
  { name: '煎饼果子', calories: 310, protein: 11.0, carbs: 42.0, fat: 11.0, portion: 200 },
  { name: '油条(1根)', calories: 230, protein: 6.5, carbs: 27.0, fat: 11.0, portion: 100 },
  { name: '米线', calories: 105, protein: 2.0, carbs: 24.0, fat: 0.2, portion: 300 },
  { name: '热干面', calories: 185, protein: 6.5, carbs: 30.0, fat: 5.0, portion: 300 },
  { name: '炸酱面', calories: 220, protein: 9.0, carbs: 32.0, fat: 7.0, portion: 300 },
  { name: '牛肉面', calories: 195, protein: 12.0, carbs: 28.0, fat: 5.0, portion: 400 },
  { name: '兰州拉面', calories: 200, protein: 10.0, carbs: 30.0, fat: 5.0, portion: 400 },
  { name: '小笼包(6个)', calories: 250, protein: 12.0, carbs: 30.0, fat: 8.5, portion: 150 },
  // 水果
  { name: '西瓜', calories: 30, protein: 0.6, carbs: 7.5, fat: 0.1, portion: 300 },
  { name: '草莓', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, portion: 200 },
  { name: '蓝莓', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, portion: 100 },
  { name: '芒果', calories: 65, protein: 0.6, carbs: 17.0, fat: 0.3, portion: 200 },
  { name: '梨', calories: 51, protein: 0.3, carbs: 13.5, fat: 0.1, portion: 200 },
  { name: '猕猴桃', calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5, portion: 100 },
  // 零食饮品
  { name: '美式咖啡(无糖)', calories: 8, protein: 0.3, carbs: 1.5, fat: 0.1, portion: 250 },
  { name: '拿铁(全脂)', calories: 120, protein: 6.0, carbs: 10.0, fat: 6.0, portion: 250 },
  { name: '奶茶(珍珠)', calories: 350, protein: 3.5, carbs: 58.0, fat: 10.0, portion: 500 },
  { name: '豆皮', calories: 188, protein: 17.0, carbs: 5.0, fat: 11.0, portion: 100 },
];

// ===== 内置运动数据库 =====
export interface ExerciseItem {
  type: string;
  name: string;
  metValue: number; // MET值，用于计算卡路里
  defaultDuration: number; // 分钟
}

export const EXERCISE_DATABASE: ExerciseItem[] = [
  { type: '有氧', name: '跑步(慢速)', metValue: 7.0, defaultDuration: 30 },
  { type: '有氧', name: '跑步(中速)', metValue: 9.8, defaultDuration: 30 },
  { type: '有氧', name: '跑步(快速)', metValue: 12.5, defaultDuration: 30 },
  { type: '有氧', name: '骑自行车(休闲)', metValue: 6.8, defaultDuration: 45 },
  { type: '有氧', name: '骑自行车(中等)', metValue: 10.0, defaultDuration: 45 },
  { type: '有氧', name: '游泳(自由泳)', metValue: 9.5, defaultDuration: 40 },
  { type: '有氧', name: '游泳(蛙泳)', metValue: 7.0, defaultDuration: 40 },
  { type: '有氧', name: '跳绳', metValue: 11.0, defaultDuration: 20 },
  { type: '有氧', name: '快走', metValue: 4.3, defaultDuration: 45 },
  { type: '有氧', name: '爬楼梯', metValue: 8.0, defaultDuration: 20 },
  { type: '有氧', name: '椭圆机', metValue: 8.5, defaultDuration: 35 },
  { type: '有氧', name: '划船机', metValue: 9.0, defaultDuration: 30 },
  { type: '力量', name: '健身房力量训练', metValue: 6.0, defaultDuration: 45 },
  { type: '力量', name: '俯卧撑/深蹲', metValue: 5.0, defaultDuration: 20 },
  { type: '力量', name: 'HIIT', metValue: 12.0, defaultDuration: 25 },
  { type: '柔韧', name: '瑜伽', metValue: 3.0, defaultDuration: 60 },
  { type: '柔韧', name: '拉伸', metValue: 2.5, defaultDuration: 15 },
  { type: '球类', name: '篮球', metValue: 8.0, defaultDuration: 60 },
  { type: '球类', name: '足球', metValue: 10.0, defaultDuration: 60 },
  { type: '球类', name: '乒乓球', metValue: 4.0, defaultDuration: 60 },
  { type: '球类', name: '羽毛球', metValue: 7.0, defaultDuration: 45 },
  { type: '其他', name: '舞蹈', metValue: 6.5, defaultDuration: 45 },
  { type: '其他', name: '太极拳', metValue: 3.5, defaultDuration: 45 },
];
