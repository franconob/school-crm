import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import { useDisclosure } from "react-use-disclosure";

import NewPaymentForm from "../payment/New";
import type { NewPayment, Student } from "../../state";
import { useAppState } from "../../state/hooks";
import { useNavigate, useParams } from "react-router-dom";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

interface DataType extends Student {
  key: React.Key;
}

const mapKeysToStrings: [keyof Student, string, ColumnsType<DataType>[0]?][] = [
  ["name", "Nombre", { fixed: "left" }],
  ["last_name", "Apellido", { fixed: "left" }],
  ["address", "Direccion"],
  ["coming_from", "Procedencia"],
  ["date_of_birth", "Fecha de nac.", { width: 120 }],
  ["dni", "Documento", { align: "right", width: 100 }],
  ["filed", "Legajo", { width: 100 }],
  ["phones", "Telefonos", { align: "right" }],
  ["place_of_birth", "Lugar de nac.", { width: 120 }],
  ["repetitive", "Repite", { width: 50 }],
];

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | undefined;
  submitPayment: (payment: NewPayment) => void;
}

/*
const PaymentModal: React.FC<PaymentModalProps> = ({ student }) => {
  const [form, setForm] = useState<NewPayment>({
    amount: 0,
    payment_date: Date.now(),
    client_id: student?.id || 0,
    observations: "",
  });

  useEffect(() => {
    if (student) {
      setForm({ ...form, client_id: student.id });
    }
  }, [student]);

  const handleFormChange: JSX.EventHandler<
    HTMLInputElement | HTMLTextAreaElement,
    InputEvent
  > = (e) => {
    const { name, value } = e.currentTarget;
    setForm({
      ...form,
      [name as keyof NewPayment]: name === "amount" ? Number(value) : value,
    });
  };

  return (
    <Modal opened={props.isOpen} onClose={props.onClose} initialFocus="#amount">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>
          Agregar pago para: <b>{props?.student?.name}</b>
        </ModalHeader>
        <ModalBody>
          <Show when={props.student} keyed>
            {(student) => (
              <NewPaymentForm
                student={student}
                onInputChange={handleFormChange}
              />
            )}
          </Show>
        </ModalBody>
        <ModalFooter>
          <HStack spacing="$4">
            <Button
              colorScheme="success"
              onClick={() => props.submitPayment(form)}
            >
              Ingresar
            </Button>
            <Button colorScheme="danger" onClick={() => props.onClose()}>
              Cancelar
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
*/

const List = () => {
  const { isOpen, open, close } = useDisclosure();
  const [selectedStudent, setSelectedStudent] = useState<Student>();
  const [, { getStudentsByGrade }] = useAppState();
  const { gradeId } = useParams();
  const navigate = useNavigate();

  if (!gradeId) throw new Error("There is no such grade");

  const handleSubmitPayment = async (payment: NewPayment) => {
    try {
      await invoke("add_payment", { payment });
      close();
      /*
      notificationService.show({
        title: "Pagos",
        description: `El pago a ${
          selectedStudent()?.last_name
        } se realizo con exito`,
        status: "success",
      });
      */
    } catch (e) {
      console.log("Error en payment", e);
    }
  };

  const dataSource = getStudentsByGrade(parseInt(gradeId, 10)).map((student) =>
    mapKeysToStrings.reduce((total, [field]) => {
      return {
        ...total,
        [field]: student[field as keyof Student],
        key: student.id,
      };
    }, {})
  );

  const columns: ColumnsType<DataType> = mapKeysToStrings.map((entry) => ({
    title: entry[1],
    dataIndex: entry[0],
    key: entry[0],
    ...(entry[2] || {}),
  }));

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      size="small"
      bordered
      scroll={{ x: 1300, y: window.innerHeight - 120 }}
      pagination={false}
      onRow={(record: DataType) => ({
        onClick: () => {
          console.log(record);
          navigate(`/student/${record.key}`);
        },
      })}
    />
  );
};

export default List;
