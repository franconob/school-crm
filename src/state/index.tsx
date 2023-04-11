import { createContext, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";

export type Student = {
  id: number;
  name: string;
  last_name: string;
  dni: string;
  place_of_birth: string;
  date_of_birth: string;
  address: string;
  phones: string;
  repetitive: boolean;
  coming_from: string;
  payments: string;
  filed: boolean;
  grade_id: number;
};

export type Grade = {
  id: number;
  name: string;
  color: string;
};

export type Payment = {
  id: number;
  client_id: number;
  amount: number;
  payment_date: number;
  observations: string;
};

export type NewPayment = Omit<Payment, "id">;

type State = {
  students: Student[];
  grades: Grade[];
};

type Context = [
  State,
  {
    setStudents: (students: Student[]) => void;
    addGrade: (grade: Grade) => void;
    getStudentsByGrade: (gradeId: number) => Student[];
    findStudentById: (id: number) => Student | undefined;
    DB: {
      saveStudent: (student: Student) => Promise<number | undefined>;
    };
  }
];

export const AppStateContext = createContext<Context | undefined>(undefined);

const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<State>({
    students: [],
    grades: [],
  });

  const appState: Context = [
    state,
    {
      setStudents(students: Student[]) {
        setState({ ...state, students });
      },
      addGrade(grade: Grade) {
        setState((prev) => ({ ...prev, grades: prev.grades.concat(grade) }));
      },
      getStudentsByGrade(gradeId: number) {
        return state.students.filter((student) => student.grade_id === gradeId);
      },
      findStudentById(id: number) {
        return state.students.find((student) => student.id === id);
      },
      DB: {
        async saveStudent(student: Student) {
          try {
            return await invoke<number>("create_student", { student });
          } catch (e) {
            console.log(e);
          }
        },
      },
    },
  ];

  async function bootstrap() {
    try {
      const students = await invoke<Student[]>("get_clients");
      const grades = await invoke<Grade[]>("get_grades");
      setState({ ...state, students, grades });
    } catch (e) {
      console.error("Error fetching students");
      console.error(e);
    }
  }

  useEffect(() => {
    bootstrap();
  }, []);

  return (
    <AppStateContext.Provider value={appState}>
      {children}
    </AppStateContext.Provider>
  );
};

export default AppStateProvider;
