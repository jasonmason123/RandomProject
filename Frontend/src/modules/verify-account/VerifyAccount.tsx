import { authenticationApiCaller } from '@app/services/api_caller/authentication-api-caller';
import { Button } from '@app/styles/common';
import { useFormik } from 'formik';
import { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const VerifyAccount = () => {
  const navigate = useNavigate();
  const { c } = useParams();
  const [isResending, setIsResending] = useState(false);
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [t] = useTranslation();

  const handleResend = async (c: string) => {
    try {
      setAuthLoading(true);
      setIsResending(true);
      await authenticationApiCaller.resendCode(c)
        .then(async (res) => {
          if (res.ok) {
            //Replace the old key with the new one
            const data = await res.json();
            navigate(`/verify-account/${data.key}`, { replace: true });
          } else {
            const err = await res.json();
            console.error("Verification failed:", err);
            // Show error message
            toast.error("An error occurred while resending the verification code. Please try again later.");
          }
        });
    } catch (error) {
      console.error("Error during verification:", error);
      toast.error("An error occurred while resending the verification code. Please try again later.");
    } finally {
      setIsResending(false);
      setAuthLoading(false);
    }
  }

  const handleVerification = async (confirmationToken: string, code: string) => {
    try {
      setAuthLoading(true);

      await authenticationApiCaller.verifyAccount(confirmationToken, code)
        .then(async (res) => {
          if (res.ok) {
            window.location.href = "/";
          } else {
            const err = await res.text();
            console.error("Verification failed:", err);
            // Show error message
            toast.error("Invalid verification code. Please try again.");
          }
        });
    } catch (error) {
      console.error("Error during verification:", error);
      toast.error("An error occurred during verification. Please try again later.");
    } finally {
      setAuthLoading(false);
    }
  };

  const { handleChange, values, handleSubmit, touched, errors, submitForm } =
    useFormik({
      initialValues: {
        code: '',
      },
      validationSchema: Yup.object({
        code: Yup.string()
          .min(6, 'Must be 6 characters')
          .max(6, 'Must be 6 characters')
          .required('Required'),
      }),
      onSubmit: async (values) => {
        await handleVerification(c as string, values.code);
      },
    });
  
  return (
    <div className="register-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <Link to="/" className="h1">
            <b>CodLUCK</b>
          </Link>
        </div>
        <div className="card-body">
          <p className="login-box-msg">
            Please enter the verification code sent to your email.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="code"
                  name="code"
                  type="text"
                  placeholder="Verification Code"
                  onChange={handleChange}
                  value={values.code}
                  isValid={touched.code && !errors.code}
                  isInvalid={touched.code && !!errors.code}
                />
                {touched.code && errors.code ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.code}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-envelope" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>

            <div className="row">
              <div className="col-12">
                <Button
                  onClick={submitForm}
                  loading={isAuthLoading}
                  disabled={isAuthLoading}
                >
                  Verify
                </Button>
              </div>
            </div>
          </form>
          <div className='flex justify-between'>
            <Link to="/register" className="text-center">
              {t('verify.backToRegister')}
            </Link>
            <div className="text-center mt-2">
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => handleResend(c as string)}
                disabled={isAuthLoading}
              >
                {isResending ? "Resending..." : "Resend Code"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyAccount;