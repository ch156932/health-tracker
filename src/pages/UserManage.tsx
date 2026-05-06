import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { User, Gender } from '../types';

const AVATARS = ['👨', '👩', '🧑', '👴', '👵', '🧒', '👦', '👧'];

interface UserFormData {
  name: string;
  avatar: string;
  gender: Gender;
  age: string;
  height: string;
  targetWeight: string;
  dailyCalorieGoal: string;
}

const emptyForm = (): UserFormData => ({
  name: '', avatar: '👨', gender: 'male',
  age: '', height: '', targetWeight: '', dailyCalorieGoal: '1800',
});

interface UserModalProps {
  initial?: User;
  onSave: (data: UserFormData) => void;
  onClose: () => void;
}

function UserModal({ initial, onSave, onClose }: UserModalProps) {
  const [form, setForm] = useState<UserFormData>(initial ? {
    name: initial.name, avatar: initial.avatar, gender: initial.gender,
    age: initial.age.toString(), height: initial.height.toString(),
    targetWeight: initial.targetWeight.toString(), dailyCalorieGoal: initial.dailyCalorieGoal.toString(),
  } : emptyForm());

  const set = (k: keyof UserFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(s => ({ ...s, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{initial ? '编辑用户' : '添加用户'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        {/* 头像选择 */}
        <div className="flex gap-2 flex-wrap">
          {AVATARS.map(a => (
            <button key={a}
              onClick={() => setForm(s => ({ ...s, avatar: a }))}
              className={`text-2xl w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${form.avatar === a ? 'bg-green-100 ring-2 ring-green-400' : 'bg-gray-100'}`}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <input value={form.name} onChange={set('name')}
            placeholder="姓名 *" className="w-full px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none" />

          <select value={form.gender} onChange={set('gender')}
            className="w-full px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none">
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input value={form.age} onChange={set('age')} placeholder="年龄" type="number"
              className="px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none" />
            <input value={form.height} onChange={set('height')} placeholder="身高(cm)" type="number"
              className="px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none" />
            <input value={form.targetWeight} onChange={set('targetWeight')} placeholder="目标体重(kg)" type="number"
              className="px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none" />
            <input value={form.dailyCalorieGoal} onChange={set('dailyCalorieGoal')} placeholder="每日卡路里目标" type="number"
              className="px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none" />
          </div>
        </div>

        <button
          onClick={() => form.name && onSave(form)}
          className="w-full bg-green-500 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2"
        >
          <Check size={16} /> 保存
        </button>
      </div>
    </div>
  );
}

export default function UserManage() {
  const { users, currentUserId, addUser, updateUser, deleteUser, switchUser, resetData } = useStore();
  const [editUser, setEditUser] = useState<User | undefined>();
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAdd = (form: UserFormData) => {
    addUser({
      name: form.name, avatar: form.avatar, gender: form.gender as Gender,
      age: parseInt(form.age) || 0, height: parseFloat(form.height) || 0,
      targetWeight: parseFloat(form.targetWeight) || 0,
      dailyCalorieGoal: parseInt(form.dailyCalorieGoal) || 1800,
    });
    setShowAdd(false);
  };

  const handleEdit = (form: UserFormData) => {
    if (!editUser) return;
    updateUser({
      ...editUser,
      name: form.name, avatar: form.avatar, gender: form.gender as Gender,
      age: parseInt(form.age) || 0, height: parseFloat(form.height) || 0,
      targetWeight: parseFloat(form.targetWeight) || 0,
      dailyCalorieGoal: parseInt(form.dailyCalorieGoal) || 1800,
    });
    setEditUser(undefined);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-800">用户管理</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-green-500 text-white rounded-xl px-3 py-1.5 text-sm"
        >
          <Plus size={14} /> 添加用户
        </button>
      </div>

      {users.map(user => (
        <div key={user.id}
          className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${user.id === currentUserId ? 'border-green-400' : 'border-transparent'}`}
        >
          <div className="flex items-center justify-between">
            <button onClick={() => switchUser(user.id)} className="flex items-center gap-3 flex-1">
              <span className="text-3xl">{user.avatar}</span>
              <div className="text-left">
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                  {user.name}
                  {user.id === currentUserId && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">当前</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '其他'} · {user.age}岁 · {user.height}cm
                </div>
              </div>
            </button>
            <div className="flex gap-2">
              <button onClick={() => setEditUser(user)}
                className="w-8 h-8 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                <Edit2 size={14} />
              </button>
              {users.length > 1 && (
                <button onClick={() => setConfirmDelete(user.id)}
                  className="w-8 h-8 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
            <div className="bg-gray-50 rounded-xl p-2">
              <span className="text-gray-400">目标体重</span>
              <span className="ml-2 font-medium">{user.targetWeight} kg</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-2">
              <span className="text-gray-400">每日目标</span>
              <span className="ml-2 font-medium">{user.dailyCalorieGoal} kcal</span>
            </div>
          </div>
        </div>
      ))}

      {/* 重置示例数据 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-sm font-medium text-gray-700 mb-2">开发工具</div>
        <button
          onClick={() => { if (confirm('将重置所有数据为示例数据，确认？')) resetData(); }}
          className="w-full py-2 bg-gray-100 text-gray-600 rounded-xl text-sm"
        >
          重置为示例数据
        </button>
      </div>

      {/* 删除确认弹窗 */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs">
            <div className="font-semibold mb-2">确认删除</div>
            <div className="text-sm text-gray-500 mb-4">删除用户后，该用户的所有数据将一并删除，无法恢复。</div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 bg-gray-100 rounded-xl text-sm">取消</button>
              <button onClick={() => { deleteUser(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm">删除</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && <UserModal onSave={handleAdd} onClose={() => setShowAdd(false)} />}
      {editUser && <UserModal initial={editUser} onSave={handleEdit} onClose={() => setEditUser(undefined)} />}
    </div>
  );
}
