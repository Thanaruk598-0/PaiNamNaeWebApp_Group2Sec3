*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem
Library    Dialogs

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        Chrome
${URL}            http://localhost:3001/login
${USERNAME}       Passenger
${PASSWORD}       t1234567

*** Test Cases ***
Create New Incident Report Without Image And Trip
    [Documentation]    ทดสอบการแจ้งรายงานเหตุการณ์ใหม่โดยไม่อัปโหลดภาพและไม่เลือก Trip
    Login To System
    Go To My Report Page
    Fill Incident Report Form Without Image And Trip
    Submit Report
    Verify Success Message

*** Keywords ***

Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    0.8s
    Capture Page Screenshot    login_page_opened.png

Login To System
    Wait Until Element Is Visible    id=identifier    10s
    Capture Page Screenshot    login_page_loaded.png

    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Capture Page Screenshot    login_credentials_entered.png

    Click Element    xpath=//button[@type="submit"]
    Wait Until Location Contains    3001    10s
    Capture Page Screenshot    login_success.png

Go To My Report Page
    Wait Until Element Is Visible    xpath=//a[contains(@href,'myReports')]    10s
    Click Element    xpath=//a[contains(@href,'myReports')]
    Wait Until Location Contains    myReports    10s
    Capture Page Screenshot    myreport_page_loaded.png

Fill Incident Report Form Without Image And Trip

    # ไม่เลือก Trip (ปล่อยค่า default)
    Capture Page Screenshot    trip_not_selected.png

    # เลือกประเภทเหตุการณ์
    Wait Until Element Is Visible    xpath=(//select)[2]    10s
    Select From List By Label        xpath=(//select)[2]    ความปลอดภัย
    Capture Page Screenshot    category_selected.png

    # เลือกหัวข้อ
    Wait Until Element Is Visible    xpath=(//select)[3]    10s
    Select From List By Label        xpath=(//select)[3]    คนขับมีพฤติกรรมไม่เหมาะสม
    Capture Page Screenshot    topic_selected.png

    # เลือกระดับความสำคัญ
    Wait Until Element Is Visible    xpath=//button[normalize-space()='สูง']    10s
    Click Element    xpath=//button[normalize-space()='สูง']
    Capture Page Screenshot    priority_selected.png

    # กรอกรายละเอียด
    Wait Until Element Is Visible    xpath=//textarea[contains(@placeholder,'อธิบาย')]    10s
    Input Text    xpath=//textarea[contains(@placeholder,'อธิบาย')]    
    ...    คนขับ ขับรถหวาดเสียวและตะโกนด่ารถคันอื่นๆ ตลอด
    Capture Page Screenshot    description_filled.png

    # ตรวจสอบตำแหน่งอัตโนมัติ
    Wait Until Page Contains Element
    ...    xpath=//*[contains(text(),'Thailand')]
    ...    20s
    Capture Page Screenshot    auto_location_detected.png

Submit Report
    Scroll Element Into View    xpath=//button[contains(.,'ส่งรายงาน')]
    Click Element    xpath=//button[contains(.,'ส่งรายงาน')]
    Capture Page Screenshot    submit_clicked.png

Verify Success Message
    Wait Until Page Contains    ส่งรายงานเรียบร้อยแล้ว    15s
    Capture Page Screenshot    report_created_successfully.png
