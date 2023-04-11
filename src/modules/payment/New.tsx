import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
} from "@hope-ui/solid";
import type { JSX } from "solid-js";
import { Student } from "../../state";

interface Props {
  student: Student;
  onInputChange: JSX.EventHandlerUnion<
    HTMLInputElement | HTMLTextAreaElement,
    InputEvent
  >;
}

const New = (props: Props) => {
  return (
    <VStack as="form">
      <FormControl>
        <FormLabel for="amount">Monto</FormLabel>
        <Input
          type="number"
          id="amount"
          name="amount"
          onInput={props.onInputChange}
        />
      </FormControl>
      <FormControl>
        <FormLabel for="observations">Observaciones</FormLabel>
        <Textarea
          id="observations"
          name="observations"
          onInput={props.onInputChange}
        ></Textarea>
      </FormControl>
    </VStack>
  );
};

export default New;
