*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem
Library    Dialogs

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        Chrome
${URL}            http://localhost:3001/login
${HOME_URL}       http://localhost:3001
${REPORT_URL}     http://localhost:3001/myReports
${USERNAME}       User01
${PASSWORD}       t1234567
${IMAGE_PATH}     ${CURDIR}/test.jpg

*** Test Cases ***
Create New Incident Report Not Successfully
    [Documentation]    ทดสอบการแจ้งรายงานเหตุการณ์ใหม่ไม่สำเร็จ

    Login To System
    Go To My Report Page
    Fill Incident Report Form
    Submit Report
    Verify Alert Message

*** Keywords ***
Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    1s
    Capture Page Screenshot    fail_login_open.png

Login To System
    Wait Until Element Is Visible    id=identifier    10s
    Capture Page Screenshot    fail_login_page.png

    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Capture Page Screenshot    fail_login_filled.png

    Click Element    xpath=//button[@type="submit"]
    Wait Until Location Contains    localhost:3001    10s
    Capture Page Screenshot    fail_login_success.png

Go To My Report Page
    Wait Until Element Is Visible    xpath=//a[contains(@href,'myReports')]    5s
    Click Element    xpath=//a[contains(@href,'myReports')]
    Wait Until Location Contains    myReports    10s
    Capture Page Screenshot    fail_myreports_page.png

Fill Incident Report Form
    Wait Until Element Is Visible    xpath=//button[normalize-space()='สูง']    5s
    Click Element    xpath=//button[normalize-space()='สูง']
    Capture Page Screenshot    fail_priority_selected.png

    Choose File    xpath=//input[@type='file']    ${IMAGE_PATH}
    Capture Page Screenshot    fail_image_uploaded.png

    Pause Execution    กรุณาคลิกปักหมุดบนแผนที่ แล้วกด OK เพื่อดำเนินการต่อ
    Capture Page Screenshot    fail_location_selected.png

Submit Report
    Click Element    xpath=//button[normalize-space()='ส่งรายงาน']
    Capture Page Screenshot    fail_submit_clicked.png

Verify Alert Message
    Wait Until Page Contains
    ...    กรุณากรอกข้อมูลให้ครบทุกช่อง (ประเภท, หัวข้อ, รายละเอียด)
    ...    10s
    Capture Page Screenshot    fail_error_message_displayed.png
