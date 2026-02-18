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
Create New Incident Report Successfully
    [Documentation]    ทดสอบการแจ้งรายงานเหตุการณ์ใหม่ และตรวจสอบว่าส่งสำเร็จ

    Login To System
    Go To My Report Page
    Fill Incident Report Form
    Submit Report
    Verify Success Message

*** Keywords ***
Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    0.8s
    Capture Page Screenshot    report_login_open.png

Login To System
    Wait Until Element Is Visible    id=identifier    10s
    Capture Page Screenshot    report_login_page.png

    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Capture Page Screenshot    report_login_filled.png

    Click Element    xpath=//button[@type="submit"]
    Wait Until Location Contains    localhost:3001    10s
    Capture Page Screenshot    report_login_success.png

Go To My Report Page
    Wait Until Element Is Visible    xpath=//a[contains(@href,'myReports')]    5s
    Click Element    xpath=//a[contains(@href,'myReports')]
    Wait Until Location Contains    myReports    10s
    Capture Page Screenshot    report_myreports_page.png

Fill Incident Report Form
    Wait Until Element Is Visible    xpath=(//select)[1]    5s
    Select From List By Value        xpath=(//select)[1]    DRIVER
    Capture Page Screenshot    report_select_category.png

    Wait Until Element Is Visible    xpath=//input[contains(@placeholder,'สรุป')]    5s
    Input Text    xpath=//input[contains(@placeholder,'สรุป')]    ขับรถและพูดจาไม่สุภาพ
    Capture Page Screenshot    report_title_entered.png

    Wait Until Element Is Visible    xpath=//button[normalize-space()='สูง']    5s
    Click Element    xpath=//button[normalize-space()='สูง']
    Capture Page Screenshot    report_priority_selected.png

    Wait Until Element Is Visible    xpath=//textarea[contains(@placeholder,'อธิบาย')]    5s
    Input Text    xpath=//textarea[contains(@placeholder,'อธิบาย')]    คนขับ ขับรถหวาดเสียวและตะโกนด่ารถคันอื่นๆ ตลอด
    Capture Page Screenshot    report_description_entered.png

    Choose File    xpath=//input[@type='file']    ${IMAGE_PATH}
    Capture Page Screenshot    report_image_uploaded.png

    Pause Execution    กรุณาคลิกปักหมุดบนแผนที่ แล้วกด OK เพื่อดำเนินการต่อ
    Capture Page Screenshot    report_location_pinned.png

Submit Report
    Click Element    xpath=//button[normalize-space()='ส่งรายงาน']
    Capture Page Screenshot    report_submit_clicked.png

Verify Success Message
    Wait Until Page Contains    ส่งรายงานเรียบร้อยแล้ว    10s
    Capture Page Screenshot    report_success.png

