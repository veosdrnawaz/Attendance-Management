import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { callBackend } from '../services/api';
import { Class, Student, AttendanceStatus, AttendanceRecord } from '../types';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle, XCircle, Clock, Info } from 'lucide-react';

const TeacherDashboard = () => {
  const { token } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    const res = await callBackend<Class[]>({ action: 'getTeacherClasses', token: token || '' });
    if (res.success && res.data) {
      setClasses(res.data);
    }
    setLoading(false);
  };

  const handleClassSelect = async (cls: Class) => {
    setSelectedClass(cls);
    setLoading(true);
    const res = await callBackend<Student[]>({ 
      action: 'getStudentsByClass', 
      token: token || '',
      payload: { classId: cls.classId } 
    });
    
    if (res.success && res.data) {
      setStudents(res.data);
      // Initialize all to PRESENT by default
      const initialStatus: Record<string, AttendanceStatus> = {};
      res.data.forEach(s => initialStatus[s.studentId] = AttendanceStatus.PRESENT);
      setAttendance(initialStatus);
    }
    setLoading(false);
  };

  const toggleStatus = (studentId: string) => {
    setAttendance(prev => {
      const current = prev[studentId];
      const next = current === AttendanceStatus.PRESENT ? AttendanceStatus.ABSENT 
                 : current === AttendanceStatus.ABSENT ? AttendanceStatus.LATE 
                 : AttendanceStatus.PRESENT;
      return { ...prev, [studentId]: next };
    });
  };

  const submitAttendance = async () => {
    if (!selectedClass) return;
    setSubmitLoading(true);
    
    const records = students.map(s => ({
      studentId: s.studentId,
      status: attendance[s.studentId],
      note: '' // Optional note field could be added
    }));

    const res = await callBackend({
      action: 'markAttendance',
      token: token || '',
      payload: {
        classId: selectedClass.classId,
        date: new Date().toISOString(),
        records: records
      }
    });

    if (res.success) {
      alert('Attendance submitted successfully!');
      setSelectedClass(null);
    } else {
      alert('Failed to submit: ' + res.error);
    }
    setSubmitLoading(false);
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return 'text-green-600 bg-green-50 border-green-200';
      case AttendanceStatus.ABSENT: return 'text-red-600 bg-red-50 border-red-200';
      case AttendanceStatus.LATE: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600';
    }
  };

  if (loading && !selectedClass) return <div className="p-8 text-center">Loading classes...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {selectedClass ? `Marking: ${selectedClass.name}` : 'My Classes'}
        </h1>
        {selectedClass && (
          <Button variant="secondary" onClick={() => setSelectedClass(null)}>Back to List</Button>
        )}
      </div>

      {!selectedClass ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
            <div 
              key={cls.classId} 
              onClick={() => handleClassSelect(cls)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all"
            >
              <h3 className="text-xl font-bold text-gray-900">{cls.name}</h3>
              <p className="text-gray-500 mt-2">{cls.schedule}</p>
              <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium">
                Take Attendance &rarr;
              </div>
            </div>
          ))}
          {classes.length === 0 && <p>No classes assigned to you.</p>}
        </div>
      ) : (
        <Card>
          <CardHeader 
            title={`Date: ${new Date().toLocaleDateString()}`} 
            action={
              <Button onClick={submitAttendance} isLoading={submitLoading}>
                Submit Attendance
              </Button>
            }
          />
          <CardContent>
            {loading ? <div className="text-center py-8">Loading students...</div> : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map(student => (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.rollNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(attendance[student.studentId])}`}>
                            {attendance[student.studentId]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                             <button onClick={() => toggleStatus(student.studentId)} className="text-indigo-600 hover:text-indigo-900">
                               Toggle
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherDashboard;