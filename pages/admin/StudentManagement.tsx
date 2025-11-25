import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { callBackend } from '../../services/api';
import { Student, Class } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Filter } from 'lucide-react';

const StudentManagement = () => {
  const { token, isAdminUnlocked } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Partial<Student>>({});
  const [filterClassId, setFilterClassId] = useState<string>('all');

  // Initial Form State
  const initialFormState = { name: '', rollNo: '', classId: '', parentContact: '' };

  useEffect(() => {
    if (isAdminUnlocked) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminUnlocked]);

  useEffect(() => {
    if (filterClassId === 'all') {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter(s => s.classId === filterClassId));
    }
  }, [filterClassId, students]);

  const loadData = async () => {
    setLoading(true);
    const [studentRes, classRes] = await Promise.all([
      callBackend<Student[]>({ action: 'getAllStudents', token: token || '' }),
      callBackend<Class[]>({ action: 'getClasses', token: token || '' })
    ]);

    if (studentRes.success && studentRes.data) {
        setStudents(studentRes.data);
        setFilteredStudents(studentRes.data);
    }
    if (classRes.success && classRes.data) setClasses(classRes.data);
    setLoading(false);
  };

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setCurrentStudent(student);
    } else {
      setCurrentStudent({ ...initialFormState, classId: classes[0]?.classId || '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const action = currentStudent.studentId ? 'updateStudent' : 'createStudent';
    
    const res = await callBackend({
      action,
      token: token || '',
      payload: currentStudent
    });

    if (res.success) {
      setIsModalOpen(false);
      loadData();
    } else {
      alert('Error: ' + res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    setLoading(true);
    const res = await callBackend({
      action: 'deleteStudent',
      token: token || '',
      payload: { studentId }
    });
    if (res.success) loadData();
    else alert('Error: ' + res.error);
    setLoading(false);
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
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
                <Filter className="w-4 h-4 text-gray-500 mr-2" />
                <select 
                    className="bg-transparent border-none outline-none text-sm"
                    value={filterClassId}
                    onChange={(e) => setFilterClassId(e.target.value)}
                >
                    <option value="all">All Classes</option>
                    {classes.map(c => <option key={c.classId} value={c.classId}>{c.name}</option>)}
                </select>
            </div>
            <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" /> Add Student
            </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Contact</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && filteredStudents.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
                ) : filteredStudents.map((student) => (
                  <tr key={student.studentId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {classes.find(c => c.classId === student.classId)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.parentContact}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenModal(student)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(student.studentId)} className="text-red-600 hover:text-red-900">
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
        title={currentStudent.studentId ? 'Edit Student' : 'Add New Student'}
        footer={
          <>
            <Button onClick={handleSave} isLoading={loading}>Save</Button>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-3">Cancel</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={currentStudent.name || ''}
              onChange={e => setCurrentStudent({ ...currentStudent, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                <input
                type="text"
                value={currentStudent.rollNo || ''}
                onChange={e => setCurrentStudent({ ...currentStudent, rollNo: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Class</label>
                <select
                    value={currentStudent.classId || ''}
                    onChange={e => setCurrentStudent({ ...currentStudent, classId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white"
                >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                        <option key={c.classId} value={c.classId}>{c.name}</option>
                    ))}
                </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Parent Contact</label>
            <input
              type="text"
              value={currentStudent.parentContact || ''}
              onChange={e => setCurrentStudent({ ...currentStudent, parentContact: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentManagement;
