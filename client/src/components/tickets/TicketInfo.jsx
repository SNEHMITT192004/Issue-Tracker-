import {
  Alert,
  AlertIcon,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  Text,
  Button,
  Box,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { Field, Form, Formik } from "formik";
import moment from "moment/moment";
import React from "react";
import MiscellaneousService from "@/services/miscellaneous-service";
import useApi from "@/hooks/useApi";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Permissions,
  createTicketStatusSelectOptions,
  createTicketTypeSelectOptions,
} from "@/util/Utils";
import { CreateTicketSchema } from "@/util/ValidationSchemas";
import RichTextEditor from "../editor/RichTextEditor";

const TicketInfo = ({
  ticketInfo,
  onHandleFormSubmit,
  formRef,
  ticketDescription,
  setTicketDescription,
  attachmentFile,
  setAttachmentFile,
  existingAttachments = [],
}) => {
  const canManageTickets = usePermissions(Permissions.canManageTickets);
  const ticketTypesSWR = useApi(MiscellaneousService.getAllTicketType());

  return (
    <Formik
      initialValues={ticketInfo}
      validationSchema={CreateTicketSchema}
      onSubmit={onHandleFormSubmit}
      innerRef={formRef}
      enableReinitialize
    >
      {({ errors, touched, handleChange }) => (
        <Form>
          <Flex gap={3}>
            <Flex direction="column" flex={1} gap={3}>
              <FormControl isInvalid={errors.title && touched.title}>
                <FormLabel>Title</FormLabel>
                <Field
                  as={Input}
                  name="title"
                  type="text"
                  onChange={handleChange}
                  disabled={!canManageTickets}
                />
                <FormErrorMessage>{errors.title}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <RichTextEditor
                  content={ticketDescription}
                  setContent={setTicketDescription}
                  disabled={!canManageTickets}
                />
              </FormControl>
            </Flex>

            <Flex direction="column" gap={3}>
              <FormControl isInvalid={errors.type && touched.type}>
                <FormLabel>Type</FormLabel>
                <Field
                  as={Select}
                  name="type"
                  type="select"
                  onChange={handleChange}
                  disabled={!canManageTickets}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {createTicketTypeSelectOptions(ticketTypesSWR.data || [])}
                </Field>
                <FormErrorMessage>{errors.type}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={errors.status && touched.status}>
                <FormLabel>Status</FormLabel>
                <Field
                  as={Select}
                  name="status"
                  type="select"
                  onChange={handleChange}
                  disabled={!canManageTickets}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {createTicketStatusSelectOptions()}
                </Field>
                <FormErrorMessage>{errors.status}</FormErrorMessage>
              </FormControl>
              <Flex gap={4}>
                <FormControl
                  isInvalid={errors.estimatedTime && touched.estimatedTime}
                >
                  <FormLabel>Estimated time</FormLabel>
                  <Field
                    as={Input}
                    name="estimatedTime"
                    type="number"
                    onChange={handleChange}
                    disabled={!canManageTickets}
                  />
                  <FormErrorMessage>{errors.estimatedTime}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={
                    errors.estimatedTimeUnit && touched.estimatedTimeUnit
                  }
                >
                  <FormLabel>Estimated Time Unit</FormLabel>
                  <Field
                    as={Select}
                    name="estimatedTimeUnit"
                    type="select"
                    onChange={handleChange}
                    disabled={!canManageTickets}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="h">Hour(s)</option>
                    <option value="d">Day(s)</option>
                  </Field>
                  <FormErrorMessage>
                    {errors.estimatedTimeUnit}
                  </FormErrorMessage>
                </FormControl>
              </Flex>

              <Flex direction="column" mt={2}>
                <Text fontSize="sm" fontWeight={500} color="inputLabel">
                  {ticketInfo.createdOn
                    ? "Created " + moment(ticketInfo.createdOn).fromNow()
                    : ""}
                </Text>
                <Text fontSize="sm" fontWeight={500} color="inputLabel">
                  {ticketInfo.updatedOn
                    ? "Updated " + moment(ticketInfo.updatedOn).fromNow()
                    : ""}
                </Text>
              </Flex>

              <FormControl mt={4}>
                <FormLabel>Attachment</FormLabel>
                <Input
                  type="file"
                  onChange={(e) => setAttachmentFile(e.target.files[0])}
                  disabled={!canManageTickets}
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Allowed: PNG, JPG, JPEG, PDF
                </Text>
              </FormControl>

              {attachmentFile && (
                <Box mt={2} p={2} bg="green.100" borderRadius="md">
                  <Text fontSize="sm" color="green.800">
                    ✓ File selected: {attachmentFile.name}
                  </Text>
                </Box>
              )}

              {existingAttachments.length > 0 && (
                <Box mt={4} p={3} bg="secondary" borderRadius="md">
                  <Text fontSize="sm" fontWeight={600} mb={2} color="gray.200">
                    Existing Attachments:
                  </Text>
                  <VStack align="start" spacing={2}>
                    {existingAttachments.map((att, idx) => (
                      <HStack key={idx} w="100%" justify="space-between" spacing={3} p={2} borderRadius="md">
                        <HStack spacing={3} maxW="80%">
                          <Text fontSize="sm" color="gray.200">📎</Text>
                          <Text fontSize="sm" isTruncated maxW="full" color="gray.200">
                            {att.fileName}
                          </Text>
                        </HStack>

                        <Button
                          size="sm"
                          leftIcon={<DownloadIcon />}
                          colorScheme="blue"
                          variant="outline"
                          color="white"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = `http://localhost:5000/${att.filePath}`;
                            link.download = att.fileName;
                            link.click();
                          }}
                        >
                          Download
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </Flex>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

export default TicketInfo;
