import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { callBackend } from '../../services/api';
import { Teacher, Class } from '../../types';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const TeacherManagement = () => {
  const { token, isAdminUnlocked, unlockAdmin } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<Partial<Teacher>>({});
  const [pin, setPin] = useState('');

  // Initial Form State
  const initialFormState = { name: '', email: '', classes: [] };

  useEffect(() => {
    if (isAdminUnlocked) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminUnlocked]);

  const loadData = async () => {
    setLoading(true);
    const [teacherRes, classRes] = await Promise.all([
      callBackend<Teacher[]>({ action: 'getTeachers', token: token || '', pin }),
      callBackend<Class[]>({ action: 'getClasses', token: token || '', pin })
    ]);

    if (teacherRes.success && teacherRes.data) setTeachers(teacherRes.data);
    if (classRes.success && classRes.data) setClasses(classRes.data);
    setLoading(false);
  };

  const handleOpenModal = (teacher?: Teacher) => {
    if (teacher) {
      setCurrentTeacher(teacher);
    } else {
      setCurrentTeacher(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const action = currentTeacher.teacherId ? 'updateTeacher' : 'createTeacher';
    
    const res = await callBackend({
      action,
      token: token || '',
      pin,
      payload: currentTeacher
    });

    if (res.success) {
      setIsModalOpen(false);
      loadData();
    } else {
      alert('Error: ' + res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (teacherId: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    setLoading(true);
    const res = await callBackend({
      action: 'deleteTeacher',
      token: token || '',
      pin,
      payload: { teacherId }
    });
    if (res.success) loadData();
    else alert('Error: ' + res.error);
    setLoading(false);
  };

  const toggleClassAssignment = (classId: string) => {
    const currentClasses = currentTeacher.classes || [];
    if (currentClasses.includes(classId)) {
      setCurrentTeacher({
        ...currentTeacher,
        classes: currentClasses.filter(id => id !== classId)
      });
    } else {
      setCurrentTeacher({
        ...currentTeacher,
        classes: [...currentClasses, classId]
      });
    }
  };

  if (!isAdminUnlocked) {
    return (
       <div className="p-6 text-center">
         <p className="text-gray-500 mb-4">Please unlock admin panel on Dashboard first.</p>
         <Button onClick={() => window.location.href='#/admin'}>Go to Dashboard</Button>
       </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" /> Add Teacher
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Classes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && teachers.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
                ) : teachers.map((teacher) => (
                  <tr key={teacher.teacherId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {teacher.classes.map(clsId => {
                          const cls = classes.find(c => c.classId === clsId);
                          return cls ? (
                            <span key={clsId} className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs">
                              {cls.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenModal(teacher)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(teacher.teacherId)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentTeacher.teacherId ? 'Edit Teacher' : 'Add New Teacher'}
        footer={
          <>
            <Button onClick={handleSave} isLoading={loading}>Save</Button>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-3">Cancel</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={currentTeacher.name || ''}
              onChange={e => setCurrentTeacher({ ...currentTeacher, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={currentTeacher.email || ''}
              onChange={e => setCurrentTeacher({ ...currentTeacher, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Classes</label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
              {classes.map(cls => (
                <div key={cls.classId} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`class-${cls.classId}`}
                    checked={(currentTeacher.classes || []).includes(cls.classId)}
                    onChange={() => toggleClassAssignment(cls.classId)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`class-${cls.classId}`} className="ml-2 block text-sm text-gray-900">
                    {cls.name} <span className="text-gray-500 text-xs">({cls.schedule})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherManagement;
