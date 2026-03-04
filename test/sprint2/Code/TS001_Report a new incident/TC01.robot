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
${IMAGE_PATH}     ${CURDIR}/Test.jpg
${VIDEO_PATH}    ${CURDIR}/test.mp4

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
    Capture Page Screenshot    _open_login_page.png

Login To System
    Wait Until Element Is Visible    id=identifier    10s
    Capture Page Screenshot    _login_page_loaded.png

    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Capture Page Screenshot    _login_filled.png

    Click Element    xpath=//button[@type="submit"]
    Wait Until Location Contains    3001    10s
    Capture Page Screenshot    _login_success.png

Go To My Report Page
    Wait Until Element Is Visible    xpath=//a[contains(@href,'myReports')]    10s
    Click Element    xpath=//a[contains(@href,'myReports')]
    Wait Until Location Contains    myReports    10s
    Capture Page Screenshot    _myreport_page.png

Fill Incident Report Form

    # ---------- เลือก Trip ----------
    Wait Until Element Is Visible    xpath=(//select)[1]    10s
    Select From List By Index        xpath=(//select)[1]    1
    Capture Page Screenshot    _trip_selected.png

    # ---------- เลือกประเภท ----------
    Wait Until Element Is Visible    xpath=(//select)[2]    10s
    Select From List By Label        xpath=(//select)[2]    ความปลอดภัย
    Capture Page Screenshot    _category_selected.png

    # ---------- เลือกหัวข้อ ----------
    Wait Until Element Is Visible    xpath=(//select)[3]    10s
    Select From List By Label        xpath=(//select)[3]    คนขับมีพฤติกรรมไม่เหมาะสม
    Capture Page Screenshot    _topic_selected.png

    # ---------- เลือกระดับความสำคัญ ----------
    Wait Until Element Is Visible    xpath=//button[normalize-space()='สูง']    10s
    Click Element    xpath=//button[normalize-space()='สูง']
    Capture Page Screenshot    _priority_selected.png

    # ---------- กรอกรายละเอียด ----------
    Wait Until Element Is Visible    xpath=//textarea[contains(@placeholder,'อธิบาย')]    10s
    Input Text    xpath=//textarea[contains(@placeholder,'อธิบาย')]    
    ...    คนขับ ขับรถหวาดเสียวและตะโกนด่ารถคันอื่นๆ ตลอด
    Capture Page Screenshot    _description_filled.png

    # ---------- อัปโหลดรูป ----------
    Choose File    xpath=//input[@type='file']    ${IMAGE_PATH}
    Capture Page Screenshot    _image_uploaded.png

    # ---------- อัปโหลดวิดีโอ ----------
    Wait Until Page Contains Element    xpath=//input[@type='file']    15s
    Choose File    xpath=//input[@type='file']    ${VIDEO_PATH}
    Sleep    2s
    Capture Page Screenshot    video_uploaded.png

       # ---------- รอ Auto Location ----------
       Wait Until Element Is Visible
       ...    xpath=//div[contains(@class,'gm-style')]
       ...    20s
       Capture Page Screenshot    location_loaded.png

Submit Report
    Scroll Element Into View    xpath=//button[contains(.,'ส่งรายงาน')]
    Click Element    xpath=//button[contains(.,'ส่งรายงาน')]
    Capture Page Screenshot    _submit_clicked.png

Verify Success Message
    Wait Until Page Contains    ส่งรายงานเรียบร้อยแล้ว    15s
    Capture Page Screenshot    _report_success.png
