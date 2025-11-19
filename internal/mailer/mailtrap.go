package mailer

import (
	"bytes"
	"errors"

	"text/template"

	gomail "gopkg.in/mail.v2"
)

type mailtrapClient struct {
	fromEmail string
	username string
	password string
}

func NewMailTrapClient(in_username string, in_password string, in_fromEmail string) (mailtrapClient, error) {
	if in_username == "" || in_password == "" {
		return mailtrapClient{}, errors.New("mat khau hoac ten nguoi dung khong duoc de trong")
	}
	
	return mailtrapClient{
		fromEmail: in_fromEmail,
		username: in_username,
		password: in_password,
	}, nil
}

// Sửa hàm này: Kết nối tới sandbox thay vì dùng live API 
func (m mailtrapClient) Send(templateFile, username, email string, data any, isSandbox bool) (int, error) {
	// Template parsing and building
	tmpl, err := template.ParseFS(FS, "templates/"+templateFile)
	if err != nil {
		return -1, err
	}

	subject := new(bytes.Buffer)
	err = tmpl.ExecuteTemplate(subject, "subject", data)
	if err != nil {
		return -1, err
	}

	body := new(bytes.Buffer)
	err = tmpl.ExecuteTemplate(body, "body", data)
	if err != nil {
		return -1, err
	}

	message := gomail.NewMessage()
	message.SetHeader("From", m.fromEmail)
	message.SetHeader("To", email)
	message.SetHeader("Subject", subject.String())

	message.AddAlternative("text/html", body.String())


	// Fix here 
	dialer := gomail.NewDialer("sandbox.smtp.mailtrap.io", 587, m.username, m.password)

	if err := dialer.DialAndSend(message); err != nil {
		return -1, err
	}

	return 200, nil
}
