import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { setWindowClass } from '@app/utils/helpers';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Form, InputGroup } from 'react-bootstrap';
import { Button } from '@profabric/react-components';
import { authenticationApiCaller } from '@app/services/api_caller/authentication-api-caller';
import { useState } from 'react';

const ForgotPassword = () => {
  const [t] = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendEmail = async (email: string) => {
    try {
      setIsLoading(true);
      const res = await authenticationApiCaller.forgotPasswordRequest(email);

      if (res.ok) {
        setEmailSent(true);
      } else {
        toast.error("We couldn't find an account with that email address.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const { handleChange, values, handleSubmit, touched, errors, submitForm } = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
    }),
    onSubmit: (values) => {
      handleSendEmail(values.email);
    },
  });

  setWindowClass('hold-transition login-page');

  return (
    <div className="login-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <Link to="/" className="h1">
            <b>CodLUCK</b>
          </Link>
        </div>
        {emailSent ? (
          <div className="card-body">
            <div className="alert alert-success flex flex-col space-y-2">
              <span>
                We have sent an instruction to reset your password. Please check your email.
              </span>
              <span>
                Didn’t receive it?{" "}
                <button
                  type="button"
                  onClick={() => handleSendEmail(values.email)}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Resend
                </button>
              </span>
            </div>
          </div>
        ) : (
          <div className="card-body">
            <p className="login-box-msg">{t('recover.forgotYourPassword')}</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <InputGroup className="mb-3">
                  <Form.Control
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    onChange={handleChange}
                    value={values.email}
                    disabled={isLoading}
                    isValid={touched.email && !errors.email}
                    isInvalid={touched.email && !!errors.email}
                  />
                  {touched.email && errors.email ? (
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
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
                    disabled={isLoading}
                    loading={isLoading}
                    onClick={submitForm}
                  >
                    {t('recover.requestNewPassword')}
                  </Button>
                </div>
              </div>
            </form>
            <p className="mt-3 mb-1">
              <Link
                aria-disabled={isLoading}
                to="/login"
              >
                {t('login.button.signIn.label')}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
