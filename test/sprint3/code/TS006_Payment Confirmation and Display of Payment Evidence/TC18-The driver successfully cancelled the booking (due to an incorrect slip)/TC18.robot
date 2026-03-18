*** Settings ***
Library    SeleniumLibrary

Suite Setup       Setup Browser
Suite Teardown    Close Browser


*** Variables ***
${URL}            http://localhost:3001/login
${ROUTE_URL}      http://localhost:3001/myRoute
${BROWSER}        chrome
${USERNAME}       Driver
${PASSWORD}       t1234567


*** Test Cases ***
TC18 Driver Cancel Booking
    Login As Driver
    Open My Route Page
    Open Confirmed Tab
    Click Cancel Booking
    Select Cancel Reason
    Confirm Cancel
    Verify Cancel Success


*** Keywords ***

Setup Browser
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed    0.5s


Login As Driver
    Wait Until Element Is Visible    id=identifier    15s
    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Click Element    xpath=//button[@type="submit"]
    Wait Until Page Does Not Contain Element    id=identifier    15s


Open My Route Page
    Go To    ${ROUTE_URL}
    Wait Until Page Contains    คำขอจองเส้นทางของฉัน    10s
    Capture Page Screenshot    myroute_page.png


Open Confirmed Tab
    Click Element    xpath=//button[contains(.,'ยืนยันแล้ว')]
    Sleep    2s
    Capture Page Screenshot    confirmed_tab.png


Click Cancel Booking
    Wait Until Element Is Visible
    ...    xpath=//button[contains(.,'ยกเลิกการจอง')]
    ...    10s

    Click Element    xpath=//button[contains(.,'ยกเลิกการจอง')]

    Wait Until Page Contains    ระบุเหตุผลการยกเลิก    10s
    Capture Page Screenshot    cancel_popup.png


Select Cancel Reason
    Wait Until Element Is Visible    xpath=//select    10s

    Select From List By Value
    ...    xpath=//select
    ...    COMMUNICATION_ISSUE


    Input Text    xpath=//textarea    สลิปไม่ถูกต้อง

    Capture Page Screenshot    selected_reason.png


Confirm Cancel
    Click Element    xpath=//button[contains(.,'ดำเนินการต่อ')]

    Wait Until Page Contains    ยืนยันยกเลิกการจอง    10s
    Capture Page Screenshot    confirm_popup.png

    Click Element    xpath=//button[contains(.,'ยืนยันยกเลิก')]

    Capture Page Screenshot    after_cancel.png
    Sleep    2s


Verify Cancel Success


    Click Element    xpath=//button[contains(.,'ยกเลิก')]


    Wait Until Page Contains    เหตุผลการยกเลิกการจอง    10s

 
    Page Should Contain    ยกเลิกการจอง

    Capture Page Screenshot    cancel_success.png