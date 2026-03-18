*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem

Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser

*** Variables ***
${BROWSER}        Chrome
${URL}            http://localhost:3001/login
${USERNAME}       Passenger
${PASSWORD}       t1234567

*** Test Cases ***
Verify User Can View Submitted Reports (Detailed UI)
    Login To System
    Go To My Report Page
    Verify Report Card Details

*** Keywords ***

Open Browser To Login Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    0.7s


Login To System
    Wait Until Element Is Visible    id=identifier    10s

    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}


    Click Element    xpath=//button[@type="submit"]
    Wait Until Location Contains    3001    10s


Go To My Report Page
    Wait Until Element Is Visible    xpath=//a[contains(@href,'myReports')]    10s
    Click Element    xpath=//a[contains(@href,'myReports')]
    Wait Until Location Contains    myReports    10s


Verify Report Card Details

    Wait Until Element Is Visible
    ...    xpath=//div[contains(@class,'rounded')]
    ...    15s

   
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight);
    Sleep    1s

    # ตรวจระดับความสำคัญ
    Page Should Contain Element    xpath=//span[contains(text(),'HIGH') or contains(text(),'MEDIUM') or contains(text(),'LOW')]

    # ตรวจประเภท
    Page Should Contain Element    xpath=//span[contains(text(),'ความปลอดภัย') or contains(text(),'เทคนิค')]

    # ตรวจหัวข้อ
    Page Should Contain Element    xpath=//h3

    # ตรวจรายละเอียด
    Page Should Contain Element    xpath=//p

    # ตรวจ Trip
    Page Should Contain Element    xpath=//*[contains(text(),'Trip')]

    # ตรวจสถานะ
    Page Should Contain Element    xpath=//*[contains(text(),'กำลัง') or contains(text(),'แก้ไข') or contains(text(),'ปฏิเสธ')]

    # ตรวจที่อยู่
    Page Should Contain Element    xpath=//*[contains(text(),'Thailand')]

    # ตรวจปุ่มแชท
    Page Should Contain Element    xpath=//button[contains(text(),'แชท')]

    Capture Page Screenshot    report_verified.png