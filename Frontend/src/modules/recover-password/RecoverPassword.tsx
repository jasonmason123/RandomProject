import { toast } from 'react-toastify';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { setWindowClass } from '@app/utils/helpers';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Form, InputGroup } from 'react-bootstrap';
import { Button } from '@app/styles/common';
import { checkStrongPassword } from '@app/utils/common';
import { useState } from 'react';
import { authenticationApiCaller } from '@app/services/api_caller/authentication-api-caller';

const RecoverPassword = () => {
  const navigate = useNavigate();
  const { c } = useParams();
  const [t] = useTranslation();
  const [passwordReset, setPasswordReset] = useState(false);
  const [isAuthLoading, setAuthLoading] = useState(false);

  const handleSendEmail = async (c: string, newPassword: string) => {
    try {
      setAuthLoading(true);
      const res = await authenticationApiCaller.resetPassword(c, newPassword);

      if (res.ok) {
        setPasswordReset(true);
        new Promise((resolve) => setTimeout(resolve, 3000))
          .then(() => {
            navigate('/login');
          });
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setAuthLoading(false);
    }
  };

  const { handleChange, values, handleSubmit, touched, errors, submitForm } = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, 'Must be 8 characters or more')
        .max(30, 'Must be 30 characters or less')
        .test('is-strong-password',
          'Password must have at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (! @ # $ % ^ & * ( ) , . ? " : { } | < >)',
          (value) => {
            if (!value) return false;
            return checkStrongPassword(value);
          })
        .required('Required'),
      confirmPassword: Yup.string()
        .min(8, 'Must be 8 characters or more')
        .max(30, 'Must be 30 characters or less')
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Required'),
    }),
    onSubmit: async (values) => {
      await handleSendEmail(c!, values.password);
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
        <div className="card-body">
          {passwordReset ? (
            <p className="login-box-msg">
              Your password has been reset successfully,
              please login again after being redirected...
            </p>
          ) : (
            <>
              <p className="login-box-msg">{t('recover.oneStepAway')}</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <InputGroup className="mb-3">
                    <Form.Control
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password"
                      onChange={handleChange}
                      value={values.password}
                      disabled={isAuthLoading}
                      isValid={touched.password && !errors.password}
                      isInvalid={touched.password && !!errors.password}
                    />
                    {touched.password && errors.password ? (
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    ) : (
                      <InputGroup.Append>
                        <InputGroup.Text>
                          <i className="fas fa-lock" />
                        </InputGroup.Text>
                      </InputGroup.Append>
                    )}
                  </InputGroup>
                </div>
                <div className="mb-3">
                  <InputGroup className="mb-3">
                    <Form.Control
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      onChange={handleChange}
                      value={values.confirmPassword}
                      disabled={isAuthLoading}
                      isValid={touched.confirmPassword && !errors.confirmPassword}
                      isInvalid={
                        touched.confirmPassword && !!errors.confirmPassword
                      }
                    />
                    {touched.confirmPassword && errors.confirmPassword ? (
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    ) : (
                      <InputGroup.Append>
                        <InputGroup.Text>
                          <i className="fas fa-lock" />
                        </InputGroup.Text>
                      </InputGroup.Append>
                    )}
                  </InputGroup>
                </div>
                <div className="row">
                  <div className="col-12">
                    <Button onClick={submitForm}>
                      {t('recover.changePassword')}
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecoverPassword;
